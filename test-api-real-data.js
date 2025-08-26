const { createClient } = require('@supabase/supabase-js');

// Test real Supabase connection and data retrieval
async function testRealDataAPI() {
  console.log('Testing real data API connection...');
  
  const supabaseUrl = 'https://lrwdoihyhnybwwntmmrs.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyd2RvaWh5aG55Ynd3bnRtbXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDA4MzIsImV4cCI6MjA3MDExNjgzMn0.MVbguGmcV_sTlVDvpsWb2oWVI-rVDy6FMrI1U300LdM';
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching citation data...');
    const { data: citations, error } = await supabase
      .from('ai_citations')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return;
    }
    
    console.log('Citation data retrieved:', citations.length, 'records');
    console.log('Sample citation:', citations[0]);
    
    // Calculate analytics like the API does
    const totalCitations = citations.length;
    const citedCount = citations.filter(c => c.cited).length;
    
    const analytics = {
      total_citations: totalCitations,
      successful_citations: citedCount,
      citation_rate: totalCitations > 0 ? Math.round((citedCount / totalCitations) * 100) : 0
    };
    
    console.log('Analytics calculated:', analytics);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRealDataAPI();