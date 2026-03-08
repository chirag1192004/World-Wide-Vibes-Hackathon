import { useState } from 'react'

function App() {
  const [activeMode, setActiveMode] = useState('entrepreneur') // entrepreneur | contractor | resident

  return (
    <div className="flex flex-col h-screen w-full bg-civic-bg text-civic-text-primary font-sans overflow-hidden">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-civic-panel border-b border-civic-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-civic-red shadow-glow-red"></div>
          <h1 className="text-xl font-bold tracking-tight">CivicPulse</h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex space-x-2 bg-civic-bg p-1 rounded-lg border border-civic-border">
          <button
            onClick={() => setActiveMode('entrepreneur')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMode === 'entrepreneur' ? 'bg-civic-panel text-civic-red shadow-glow-red border border-civic-red/30' : 'text-civic-text-secondary hover:text-civic-text-primary'}`}
          >
            🔴 Entrepreneur
          </button>
          <button
            onClick={() => setActiveMode('contractor')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMode === 'contractor' ? 'bg-civic-panel text-civic-yellow shadow-glow-yellow border border-civic-yellow/30' : 'text-civic-text-secondary hover:text-civic-text-primary'}`}
          >
            🟡 Contractor
          </button>
          <button
            onClick={() => setActiveMode('resident')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMode === 'resident' ? 'bg-civic-panel text-civic-green shadow-glow-green border border-civic-green/30' : 'text-civic-text-secondary hover:text-civic-text-primary'}`}
          >
            🟢 Resident
          </button>
        </div>

        <div className="text-sm font-medium text-civic-text-secondary">
          Montgomery, AL
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map Area (70%) */}
        <div className="w-[70%] relative border-r border-civic-border bg-black/50">
          <div className="absolute inset-0 flex items-center justify-center text-civic-text-secondary">
            [ Mapbox 3D Engine Loading... ]
          </div>
        </div>

        {/* Side Panel (30%) */}
        <div className="w-[30%] bg-civic-panel p-6 overflow-y-auto">
          {activeMode === 'entrepreneur' && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-civic-red">Predictive Site Selection</h2>
              <p className="text-sm text-civic-text-secondary mb-6">Analyze 10 years of civic data to predict business survival before you sign a lease.</p>
              {/* Entrepreneur content placeholder */}
            </div>
          )}

          {activeMode === 'contractor' && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-civic-yellow">B2G Procurement Engine</h2>
              <p className="text-sm text-civic-text-secondary mb-6">Match your business to upcoming city contracts and auto-generate winning bids.</p>
              {/* Contractor content placeholder */}
            </div>
          )}

          {activeMode === 'resident' && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-civic-green">Civic Equity Tracker</h2>
              <p className="text-sm text-civic-text-secondary mb-6">Discover the civic health of your neighborhood and demand data-backed accountability.</p>
              {/* Resident content placeholder */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
