export default function ConfigPage() {
  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-fredoka text-2xl lg:text-3xl font-semibold mb-2" style={{ color: 'var(--ian-dark)' }}>
          Configuración
        </h1>
        <p className="font-quicksand text-sm text-gray-500 mb-8">Ajustes generales del sistema</p>
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ backgroundColor: '#EFF6FF' }}
          >
            ⚙️
          </div>
          <h2 className="font-fredoka text-lg font-semibold mb-2" style={{ color: 'var(--ian-dark)' }}>
            Módulo en construcción
          </h2>
          <p className="font-quicksand text-sm text-gray-400">
            Aquí podrás configurar servicios, precios, ciclo escolar y más.
          </p>
        </div>
      </div>
    </main>
  )
}
