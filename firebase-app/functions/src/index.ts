import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'

initializeApp()

type Role = 'admin' | 'teacher' | 'student'

interface CreateInvitePayload {
  email: string
  name: string
  role: Role
  teacherId?: string
}

/**
 * Reemplaza al edge function `register-student` de Supabase.
 * Un admin (o un teacher creando a SU estudiante) precrea el registro de un
 * usuario antes de que exista una cuenta de Firebase Auth para él/ella —
 * porque con Google Sign-In no controlamos cuándo la persona inicia sesión
 * por primera vez. El registro queda "pendiente" en `invites/{email}` hasta
 * que la persona entra con Google y `claimInvite` lo reclama.
 */
export const createInvite = onCall<CreateInvitePayload>(async (request) => {
  const callerRole = request.auth?.token.role as Role | undefined
  if (!request.auth || (callerRole !== 'admin' && callerRole !== 'teacher')) {
    throw new HttpsError('permission-denied', 'Solo un admin o teacher puede invitar usuarios.')
  }

  const { email, name, role, teacherId } = request.data
  if (!email || !name || !role) {
    throw new HttpsError('invalid-argument', 'email, name y role son obligatorios.')
  }
  if (callerRole === 'teacher' && role !== 'student') {
    throw new HttpsError('permission-denied', 'Un teacher solo puede invitar estudiantes.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const db = getFirestore()
  const inviteRef = db.collection('invites').doc(normalizedEmail)

  if ((await inviteRef.get()).exists) {
    throw new HttpsError('already-exists', `Ya existe una invitación pendiente para ${normalizedEmail}.`)
  }

  await inviteRef.set({
    email: normalizedEmail,
    name,
    role,
    teacherId: role === 'student' ? (teacherId ?? request.auth.uid) : null,
    invitedBy: request.auth.uid,
    createdAt: FieldValue.serverTimestamp(),
  })

  return { ok: true }
})

/**
 * Se llama justo después de un primer login con Google exitoso. Si existe
 * una invitación pendiente para el email autenticado, la convierte en el
 * documento `users/{uid}` definitivo y setea el custom claim `role` (usado
 * por las Firestore/Storage Security Rules). Corre con privilegios de admin
 * para que el cliente nunca pueda auto-asignarse un rol.
 */
export const claimInvite = onCall(async (request) => {
  if (!request.auth?.token.email) {
    throw new HttpsError('unauthenticated', 'Debes iniciar sesión con Google primero.')
  }

  const uid = request.auth.uid
  const email = request.auth.token.email.toLowerCase()
  const db = getFirestore()

  const userRef = db.collection('users').doc(uid)
  const existing = await userRef.get()
  if (existing.exists) {
    return { profile: existing.data() }
  }

  const inviteRef = db.collection('invites').doc(email)
  const invite = await inviteRef.get()
  if (!invite.exists) {
    throw new HttpsError('not-found', 'No hay ninguna invitación pendiente para este correo. Contacta a tu profesor o administrador.')
  }

  const inviteData = invite.data()!
  const profile = {
    id: uid,
    email,
    name: inviteData.name,
    role: inviteData.role as Role,
    teacherId: inviteData.teacherId ?? null,
    avatarUrl: request.auth.token.picture ?? null,
    createdAt: FieldValue.serverTimestamp(),
  }

  await db.batch().set(userRef, profile).delete(inviteRef).commit()
  await getAuth().setCustomUserClaims(uid, { role: inviteData.role })

  return { profile }
})
