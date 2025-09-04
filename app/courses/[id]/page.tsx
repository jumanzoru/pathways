type Props = { params: { id: string } }

export default function CourseDetail({ params }: Props) {
  return (
    <div>
      <h1 className="text-xl font-semibold">Course: {params.id}</h1>
      <p className="text-sm text-gray-600">
        Placeholder detail page. Later this will fetch info for {params.id}.
      </p>
    </div>
  )
}
