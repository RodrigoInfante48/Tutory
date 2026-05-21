import AppLayout from '../../app/AppLayout'
import QuizList from '../quizzes/QuizList'

export default function TeacherQuizzesPage() {
  return (
    <AppLayout title="Quizzes">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <QuizList />
      </div>
    </AppLayout>
  )
}
