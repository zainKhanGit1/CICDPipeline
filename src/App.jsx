
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import './App.css'

function App() {
  const [cidr, setCidr] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function toIP(num) {
    return [24, 16, 8, 0]
      .map(shift => (num >>> shift) & 255)
      .join('.')
  }

  function calculateSubnet(e) {
    e.preventDefault()

    const parts = cidr.trim().split('/')
    const ip = parts[0]
    const prefix = Number(parts[1])
    const octets = ip.split('.')

    if (
      parts.length !== 2 ||
      octets.length !== 4 ||
      !/^\d+$/.test(parts[1]) ||
      prefix < 0 ||
      prefix > 32 ||
      octets.some(o => !/^\d+$/.test(o) || Number(o) > 255)
    ) {
      setError('Please enter a valid CIDR, e.g. 10.0.0.0/16')
      setResult(null)
      return
    }

    const ipNum = octets.reduce(
      (acc, octet) => ((acc << 8) | Number(octet)) >>> 0,
      0
    )

    const mask = prefix === 0
      ? 0
      : (0xFFFFFFFF << (32 - prefix)) >>> 0

    const network = (ipNum & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0

    const totalIPs = 2 ** (32 - prefix)

    const usableHosts = prefix >= 31
      ? prefix === 31 ? 2 : 1
      : totalIPs - 2

    const firstHost = prefix >= 31 ? network : network + 1
    const lastHost = prefix >= 31 ? broadcast : broadcast - 1

    const subnetMask = toIP(mask)
    const networkAddress = toIP(network)
    const broadcastAddress = toIP(broadcast)

    const wildcardMask = toIP((~mask) >>> 0)

    const newResult = {
      input: ip + '/' + prefix,
      networkAddress,
      subnetMask,
      wildcardMask,
      broadcastAddress,
      firstHost: toIP(firstHost),
      lastHost: toIP(lastHost),
      totalIPs,
      usableHosts,
      prefix
    }

    setResult(newResult)
    setError('')
  }

  function downloadPDF() {
    if (!result) return

    const doc = new jsPDF()

    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 210, 45, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('SUBNET CALCULATOR', 15, 20)

    doc.setFontSize(10)
    doc.text('IPv4 Network Analysis Report', 15, 30)
    doc.text(`CIDR: ${result.input}`, 15, 38)

    const rows = [
      ['Network Address', result.networkAddress],
      ['Subnet Mask', result.subnetMask],
      ['Wildcard Mask', result.wildcardMask],
      ['Broadcast Address', result.broadcastAddress],
      ['First Usable IP', result.firstHost],
      ['Last Usable IP', result.lastHost],
      ['CIDR Prefix', '/' + result.prefix],
      ['Total IP Addresses', result.totalIPs.toLocaleString()],
      ['Usable Hosts', result.usableHosts.toLocaleString()]
    ]

    let y = 62

    rows.forEach(([label, value], index) => {
      if (index % 2 === 0) {
        doc.setFillColor(241, 245, 249)
        doc.rect(15, y - 6, 180, 12, 'F')
      }

      doc.setTextColor(71, 85, 105)
      doc.setFontSize(10)
      doc.text(label, 20, y + 1)

      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'bold')
      doc.text(String(value), 120, y + 1)
      doc.setFont('helvetica', 'normal')

      y += 13
    })

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.text('Generated using IPv4 Subnet Calculator', 15, 275)

    doc.save(`Subnet-Report-${result.input.replace('/', '-')}.pdf`)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>Net<span className="blue">Calc</span></span>
        </div>
        <span className="nav-label">NETWORKING TOOLS / IPv4</span>
      </nav>

      <main className="main">
        <div className="hero">
          <div className="eyebrow">
            <span className="status-dot"></span>
            NETWORK ENGINEERING TOOL
          </div>

          <h1>IPv4 Subnet <span>Calculator</span></h1>

          <p>
            Calculate network ranges, subnet masks, broadcast addresses
            and usable host capacity instantly.
          </p>
        </div>

        <section className="calculator">
          <div className="section-heading">
            <div>
              <h2>Subnet Configuration</h2>
              <p>Enter an IPv4 address with its CIDR prefix.</p>
            </div>
            <span className="protocol">IPv4</span>
          </div>

          <form onSubmit={calculateSubnet}>
            <label htmlFor="cidr">IP ADDRESS / CIDR</label>

            <div className="input-group">
              <input
                id="cidr"
                type="text"
                value={cidr}
                onChange={e => setCidr(e.target.value)}
                placeholder="10.0.0.0/16"
              />
              <button type="submit">
                Calculate <span>→</span>
              </button>
            </div>

            <div className="input-hint">
              Example: 192.168.1.0/24
            </div>
          </form>

          {error && <div className="error">{error}</div>}
        </section>

        {result && (
          <section className="results">
            <div className="results-heading">
              <div>
                <div className="eyebrow">CALCULATION COMPLETE</div>
                <h2>Subnet Analysis</h2>
                <p>Results for <strong>{result.input}</strong></p>
              </div>

              <button className="download-btn" onClick={downloadPDF}>
                ↓ Download PDF
              </button>
            </div>

            <div className="stats">
              <div className="stat-card">
                <span>TOTAL IP ADDRESSES</span>
                <h3>{result.totalIPs.toLocaleString()}</h3>
              </div>

              <div className="stat-card highlight">
                <span>USABLE HOSTS</span>
                <h3>{result.usableHosts.toLocaleString()}</h3>
              </div>

              <div className="stat-card">
                <span>CIDR PREFIX</span>
                <h3>/{result.prefix}</h3>
              </div>
            </div>

            <div className="details">
              <div className="details-title">NETWORK DETAILS</div>

              {[
                ['Network Address', result.networkAddress],
                ['Subnet Mask', result.subnetMask],
                ['Wildcard Mask', result.wildcardMask],
                ['Broadcast Address', result.broadcastAddress],
                ['First Usable IP', result.firstHost],
                ['Last Usable IP', result.lastHost]
              ].map(([label, value]) => (
                <div className="detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {!result && (
          <div className="empty-state">
            <div className="empty-icon">⌘</div>
            <h3>Ready to calculate</h3>
            <p>Enter a CIDR notation above to view your subnet analysis.</p>
          </div>
        )}

        <footer>
          <span>NetCalc · IPv4 Subnet Calculator</span>
          <span>Built for Network Engineers</span>
        </footer>
      </main>
    </div>
  )
}

export default App
