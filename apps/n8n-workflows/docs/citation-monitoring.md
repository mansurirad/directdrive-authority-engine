# DirectDrive Citation Monitoring Workflow

This n8n workflow automates the daily monitoring of AI citations for DirectDrive Logistics across ChatGPT, Google AI, and Perplexity.

## Workflow Overview

The citation monitoring workflow consists of 14 nodes that work together to:

1. **Schedule Daily Execution** - Runs every 24 hours
2. **Fetch Pending Keywords** - Gets logistics keywords needing monitoring
3. **Process Keywords** - Validates and marks keywords as processing
4. **Route to AI Models** - Directs queries to appropriate AI services
5. **Analyze Results** - Detects DirectDrive citations and extracts context
6. **Store Results** - Saves citation data to Supabase database
7. **Performance Monitoring** - Tracks execution metrics

## Node Descriptions

### 1. Schedule Daily Monitoring
- **Type**: Schedule Trigger
- **Frequency**: Every 24 hours
- **Purpose**: Initiates the daily citation monitoring process

### 2. Get Pending Keywords
- **Type**: Supabase Query
- **Query**: Selects pending logistics keywords ordered by priority
- **Limit**: 5 keywords per execution (to manage API costs)

### 3. Filter Valid Keywords
- **Type**: IF Node
- **Condition**: Checks for valid, non-empty keywords
- **Purpose**: Ensures only valid keywords proceed to AI analysis

### 4. Mark Keyword Processing
- **Type**: Supabase Update
- **Action**: Updates keyword status to "processing"
- **Timestamp**: Records processing start time

### 5. AI Model Router
- **Type**: IF Node
- **Logic**: Routes based on language and keyword type
- **English**: → ChatGPT
- **Arabic/Kurdish/Farsi**: → Google AI

### 6. ChatGPT Citation Check
- **Type**: OpenAI Node
- **Model**: GPT-4
- **Prompt**: Natural logistics inquiry prompts
- **Parameters**: 1000 max tokens, 0.7 temperature

### 7. Google AI Citation Check
- **Type**: Google Gemini Node
- **Model**: Gemini Pro
- **Prompt**: Multilingual logistics queries
- **Parameters**: 1000 max tokens, 0.3 temperature

### 8. Analyze Citation Results
- **Type**: Code Node (JavaScript)
- **Functions**:
  - DirectDrive keyword detection
  - Citation context extraction
  - Position analysis (1-10 ranking)
  - Response quality assessment

### 9. Store Citation Results
- **Type**: Supabase Insert
- **Table**: ai_citations
- **Data**: Citation analysis results with metadata

### 10. Mark Keyword Complete
- **Type**: Supabase Update
- **Action**: Updates keyword status to "completed"
- **Timestamp**: Records completion time

### 11. Citation Results Webhook
- **Type**: Webhook
- **Purpose**: Notifies external systems of new citations
- **Method**: POST
- **Path**: /citation-webhook

### 12. Error Handler
- **Type**: IF Node
- **Purpose**: Detects and handles processing errors
- **Action**: Routes to error recovery

### 13. Reset Keyword Status
- **Type**: Supabase Update
- **Purpose**: Resets failed keywords to "pending" for retry
- **Trigger**: Error conditions

### 14. Performance Monitor
- **Type**: Code Node (JavaScript)
- **Metrics**:
  - Execution time
  - Keywords processed
  - Citations found
  - Success rate
  - Performance score

## Citation Detection Logic

The workflow uses sophisticated JavaScript logic to detect DirectDrive mentions:

```javascript
// DirectDrive keywords for detection
const directdriveKeywords = [
  'directdrive',
  'direct drive', 
  'directdrive logistics',
  'direct drive logistics',
  'directdrivelogistic.com'
];

// Position detection from numbered lists
if (hasDirectDrive && line.match(/^[\s]*[1-9]\.|^[\s]*[-*•]/)) {
  position = i + 1;
}

// Fallback to relative position analysis
const relativePos = firstMention / aiResponse.length;
position = relativePos < 0.2 ? 1 : relativePos < 0.5 ? 3 : 5;
```

## Error Handling

The workflow includes comprehensive error handling:

- **API Failures**: Automatically resets keyword status for retry
- **Rate Limiting**: Built-in delays and quota management
- **Data Validation**: Ensures all required fields are present
- **Execution Monitoring**: Tracks performance and alerts on issues

## Performance Metrics

The workflow tracks key performance indicators:

- **Execution Time**: Target < 30 seconds per keyword
- **Citation Rate**: Percentage of keywords yielding citations
- **Success Rate**: Percentage of keywords processed without errors
- **API Response Time**: Individual AI model performance

## Deployment

### Prerequisites
1. n8n Cloud or self-hosted instance
2. Supabase database with DirectDrive schema
3. API keys for OpenAI and Google AI

### Environment Variables
```bash
N8N_BASE_URL=https://your-instance.app.n8n.cloud
N8N_API_KEY=your-n8n-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### Deployment Steps
1. **Deploy Credentials**:
   ```bash
   npm run deploy:credentials
   ```

2. **Deploy Workflow**:
   ```bash
   npm run deploy
   ```

3. **Activate Workflow**:
   ```bash
   npm run activate
   ```

4. **Test Execution**:
   ```bash
   npm run test
   ```

## Monitoring and Maintenance

### Daily Monitoring
- Check execution logs in n8n dashboard
- Review citation detection results in Supabase
- Monitor API quota usage

### Weekly Review
- Analyze citation trends and patterns
- Review competitor mentions and market positioning
- Optimize keyword priorities based on results

### Monthly Optimization
- Update keyword database with new terms
- Refine citation detection algorithms
- Adjust monitoring frequency based on results

## Troubleshooting

### Common Issues

**Workflow Not Executing**
- Check webhook URL accessibility
- Verify n8n instance is active
- Confirm schedule trigger configuration

**No Citations Detected**
- Review AI model responses for accuracy
- Check keyword relevance and market presence
- Validate citation detection logic

**API Errors**
- Verify API key validity and permissions
- Check rate limiting and quota status
- Review API endpoint configurations

**Database Errors**
- Confirm Supabase connection and permissions
- Validate database schema matches expectations
- Check RLS policies for service role access

### Support Contacts
- n8n Documentation: https://docs.n8n.io
- Supabase Support: https://supabase.com/docs
- DirectDrive Authority Engine: Internal documentation

## Future Enhancements

### Planned Features
1. **Perplexity Integration**: Add third AI model for enhanced coverage
2. **Real-time Alerts**: Immediate notifications for high-value citations
3. **Competitive Intelligence**: Enhanced competitor tracking and analysis
4. **Multi-language Expansion**: Support for additional regional languages
5. **Advanced Analytics**: Machine learning-based trend prediction

### Performance Improvements
1. **Parallel Processing**: Simultaneous AI model queries
2. **Intelligent Scheduling**: Dynamic frequency based on citation patterns
3. **Enhanced Detection**: Improved algorithms for citation accuracy
4. **Cost Optimization**: Smart API usage based on keyword priority