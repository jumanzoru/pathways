// app/clubs/[id]/page.tsx
type Props = { params: { id: string } }

export default function ClubDetail({ params }: Props) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Club: {params.id}</h1>
      <p className="text-sm text-gray-600">
        Placeholder detail page. Later this will fetch info for {params.id}.
      </p>
    </div>
  )
}
