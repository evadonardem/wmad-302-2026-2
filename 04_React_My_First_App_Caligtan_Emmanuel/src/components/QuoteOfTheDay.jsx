import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Stack, Divider, Button, Chip, Box, Select, MenuItem } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { getRandomQuote, getTags } from '../services/quoteService';

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  // TODO 2 [Reference Hook]
  const selectTagRef = useRef(null);

  const loadRandomQuote = async () => {
    // TODO 3 [Async Request Handler]: 
    // Extract current value from selectTagRef (fallback to empty string if undefined)
    const activeTag = selectTagRef.current?.value || '';
    
    // Fetch random quote with tag parameter
    const newRandomQuote = await getRandomQuote(activeTag);
    
    // Update states
    setQuote(newRandomQuote);
    setSelectedTag(activeTag);
  };

  const loadTags = async () => {
    // TODO 4 [Async List Population]
    const fetchedTags = await getTags();
    setTags(fetchedTags || []);
  };

  useEffect(() => {
    // TODO 5 [Component Lifecycle]
    loadRandomQuote();
    loadTags();
  }, []);

  return (
    <Card
      variant="elevation"
      elevation={5}
      sx={{
        maxWidth: 500,
        width: '100%',
        borderRadius: 3
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="overline" color="text.secondary" letterSpacing={2} textAlign="center">
            Quote of the Day
          </Typography>

          <Box textAlign="center">
            {/* TODO 6 [Conditional Chip List] */}
            {quote.tags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={selectedTag === tag ? "success" : "secondary"}
                sx={{ mr: 0.25, mb: 0.5 }}
              />
            ))}
          </Box>

          {/* TODO 7 [Text Content Mapping] */}
          <Typography
            variant="h5"
            component="p"
            fontStyle="italic"
            textAlign="center"
            sx={{ fontWeight: '400', lineHeight: 1.5 }}
          >
            "{quote.text || 'Loading quote...'}"
          </Typography>

          {/* TODO 8 [Author Content Mapping] */}
          <Typography variant="subtitle1" textAlign="right" color="text.secondary">
            — {quote.author || 'Unknown'}
          </Typography>

          <Divider />

          <Stack direction="row" spacing={0.5} justifyContent="space-between" alignItems="center">
            {/* TODO 9 & 10 [Controlled Input Integration & Select Option Generation] */}
            <Select
              fullWidth
              displayEmpty
              size="small"
              inputRef={selectTagRef}
              defaultValue=""
            >
              <MenuItem value=""><em>Any</em></MenuItem>
              {tags.map((tags) => (
                <MenuItem key={tags} value={tags}>
                  {tags}
                </MenuItem>
              ))}
            </Select>
            
            {/* TODO 11 [Action Trigger Binding] */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadRandomQuote}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Next Quote
            </Button>
          </Stack>

        </Stack>
      </CardContent>
    </Card>
  );
}