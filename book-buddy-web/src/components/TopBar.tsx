export function TopBar({ title }: { title: string }) {
  return (
    <header style={{ padding: 16 }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: 28 }}>{title}</h1>
    </header>
  )
}
