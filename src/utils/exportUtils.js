// src/utils/exportUtils.js
// Utility functions for exporting analytics data to CSV and PDF

/**
 * Export analytics data to CSV
 */
export function exportToCSV(analytics, filename = 'domain-analytics') {
  if (!analytics) return;

  const timestamp = new Date().toISOString().split('T')[0];
  const csvFilename = `${filename}-${timestamp}.csv`;

  // Prepare CSV data
  const rows = [];
  
  // Header
  rows.push(['Domain Analytics Report']);
  rows.push(['Generated:', new Date().toLocaleString()]);
  rows.push(['Domain:', analytics.domain]);
  rows.push([]);
  
  // Summary metrics
  rows.push(['Summary Metrics']);
  rows.push(['Total Keywords', analytics.totalKeywords || 0]);
  rows.push(['Organic Traffic', analytics.organicTraffic || 'N/A']);
  rows.push(['Visibility Score', analytics.visibilityScore || 'N/A']);
  rows.push([]);
  
  // Top Keywords
  if (analytics.topKeywords && analytics.topKeywords.length > 0) {
    rows.push(['Top Ranking Keywords']);
    rows.push(['Keyword', 'Position', 'Search Volume', 'Traffic', 'CPC']);
    
    analytics.topKeywords.forEach(kw => {
      rows.push([
        kw.keyword || '',
        kw.rank_absolute || kw.position || '',
        kw.search_volume || '',
        kw.traffic || '',
        kw.cpc ? `$${kw.cpc}` : ''
      ]);
    });
    rows.push([]);
  }
  
  // Competitors
  if (analytics.competitors && analytics.competitors.length > 0) {
    rows.push(['Top Competitors']);
    rows.push(['Domain', 'Common Keywords', 'Avg Position', 'Visibility']);
    
    analytics.competitors.forEach(comp => {
      rows.push([
        comp.domain || '',
        comp.intersections || comp.common_keywords || '',
        comp.avg_position || '',
        comp.visibility || ''
      ]);
    });
    rows.push([]);
  }
  
  // Backlinks
  if (analytics.backlinks) {
    rows.push(['Backlink Summary']);
    rows.push(['Total Backlinks', analytics.backlinks.total || 0]);
    rows.push(['Referring Domains', analytics.backlinks.referring_domains || 0]);
    rows.push(['Domain Rating', analytics.backlinks.domain_rating || 'N/A']);
  }
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  // Download
  downloadFile(csvContent, csvFilename, 'text/csv;charset=utf-8;');
}

/**
 * Export analytics data to PDF (using HTML to PDF approach)
 */
export function exportToPDF(analytics, filename = 'domain-analytics') {
  if (!analytics) return;

  const timestamp = new Date().toISOString().split('T')[0];
  const pdfFilename = `${filename}-${timestamp}.pdf`;

  // Create HTML content
  const htmlContent = generatePDFHTML(analytics);
  
  // Create a temporary iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();
  
  // Wait for content to load, then print
  iframe.contentWindow.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.print();
      // Remove iframe after printing
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };
}

/**
 * Generate HTML for PDF export
 */
function generatePDFHTML(analytics) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Domain Analytics Report - ${analytics.domain}</title>
  <style>
    @media print {
      @page { margin: 1in; }
      body { margin: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
    .summary { 
      background: #f3f4f6; 
      padding: 15px; 
      border-radius: 8px; 
      margin: 20px 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .metric { text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
      font-size: 14px;
    }
    th { 
      background: #2563eb; 
      color: white; 
      padding: 10px; 
      text-align: left;
      font-weight: 600;
    }
    td { 
      padding: 8px; 
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover { background: #f9fafb; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>🌐 Domain Analytics Report</h1>
  <div class="meta">
    <strong>Domain:</strong> ${analytics.domain}<br>
    <strong>Generated:</strong> ${new Date().toLocaleString()}<br>
    <strong>Location:</strong> ${analytics.location || 'United States'}
  </div>

  <div class="summary">
    <div class="metric">
      <div class="metric-value">${analytics.totalKeywords || 0}</div>
      <div class="metric-label">Total Keywords</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics.organicTraffic || 'N/A'}</div>
      <div class="metric-label">Organic Traffic</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics.visibilityScore || 'N/A'}</div>
      <div class="metric-label">Visibility Score</div>
    </div>
  </div>

  ${analytics.topKeywords && analytics.topKeywords.length > 0 ? `
  <h2>📊 Top Ranking Keywords</h2>
  <table>
    <thead>
      <tr>
        <th>Keyword</th>
        <th>Position</th>
        <th>Search Volume</th>
        <th>Traffic</th>
        <th>CPC</th>
      </tr>
    </thead>
    <tbody>
      ${analytics.topKeywords.map(kw => `
        <tr>
          <td>${kw.keyword || ''}</td>
          <td>${kw.rank_absolute || kw.position || ''}</td>
          <td>${(kw.search_volume || 0).toLocaleString()}</td>
          <td>${(kw.traffic || 0).toLocaleString()}</td>
          <td>${kw.cpc ? '$' + kw.cpc.toFixed(2) : 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${analytics.competitors && analytics.competitors.length > 0 ? `
  <h2>🎯 Top Competitors</h2>
  <table>
    <thead>
      <tr>
        <th>Domain</th>
        <th>Common Keywords</th>
        <th>Avg Position</th>
        <th>Visibility</th>
      </tr>
    </thead>
    <tbody>
      ${analytics.competitors.map(comp => `
        <tr>
          <td>${comp.domain || ''}</td>
          <td>${comp.intersections || comp.common_keywords || ''}</td>
          <td>${comp.avg_position || 'N/A'}</td>
          <td>${comp.visibility || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${analytics.backlinks ? `
  <h2>🔗 Backlink Summary</h2>
  <table>
    <tbody>
      <tr>
        <td><strong>Total Backlinks</strong></td>
        <td>${(analytics.backlinks.total || 0).toLocaleString()}</td>
      </tr>
      <tr>
        <td><strong>Referring Domains</strong></td>
        <td>${(analytics.backlinks.referring_domains || 0).toLocaleString()}</td>
      </tr>
      <tr>
        <td><strong>Domain Rating</strong></td>
        <td>${analytics.backlinks.domain_rating || 'N/A'}</td>
      </tr>
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    <p>Generated by OrganiTrafficBoost - SEO & Web Traffic Automation Platform</p>
    <p>© ${new Date().getFullYear()} All rights reserved</p>
  </div>
</body>
</html>
  `;
}

/**
 * Helper function to download a file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export comparison data to CSV
 */
export function exportComparisonToCSV(analyses, filename = 'domain-comparison') {
  if (!analyses || analyses.length === 0) return;

  const timestamp = new Date().toISOString().split('T')[0];
  const csvFilename = `${filename}-${timestamp}.csv`;

  const rows = [];
  
  // Header
  rows.push(['Domain Comparison Report']);
  rows.push(['Generated:', new Date().toLocaleString()]);
  rows.push([]);
  
  // Summary comparison
  rows.push(['Domain', 'Total Keywords', 'Organic Traffic', 'Visibility Score', 'Analysis Date']);
  analyses.forEach(analysis => {
    rows.push([
      analysis.domain,
      analysis.total_keywords || 0,
      analysis.organic_traffic || 'N/A',
      analysis.visibility_score || 'N/A',
      new Date(analysis.analyzed_at).toLocaleDateString()
    ]);
  });
  
  // Convert to CSV
  const csvContent = rows.map(row => 
    row.map(cell => {
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  downloadFile(csvContent, csvFilename, 'text/csv;charset=utf-8;');
}
