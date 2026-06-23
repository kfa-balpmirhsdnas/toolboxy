export default function HomePage({ params }: { params: { lang: string } }) {
  return (
    <div style={{padding:'40px', fontSize:'24px'}}>
      Hello from {params.lang} - layout is working!
    </div>
  )
}
