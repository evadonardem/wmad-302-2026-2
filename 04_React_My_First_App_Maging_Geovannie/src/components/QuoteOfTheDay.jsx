import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Stack, Divider, Button, Chip, Box, Select, MenuItem, CircularProgress } from '@mui/material';
import { SkipNext } from '@mui/icons-material';
import { getRandomQuote, getTags } from '../services/quoteService';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRandomQuote = async (tagValue = selectedTag || '') => {
    setIsLoading(true);
    try {
      const nextQuote = await getRandomQuote(tagValue || null);
      setQuote(nextQuote);
      setSelectedTag(tagValue || '');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    const nextTags = await getTags();
    setTags(nextTags);
  };

  useEffect(() => {
    loadRandomQuote('');
    loadTags();
  }, []);

  return (
    <Card
      variant="elevation"
      elevation={5}
      sx={{
        maxWidth: 500,
        width: '100%',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 2, textAlign: 'center' }}
          >
            Quote of the Day
          </Typography>

          <Box> 
            textAlign: 'center', mb: 1, display: 'flex', justifyContent: 'center', flexWrap: 'wrap'
            {quote.tags?.map((t) => (
              <Chip
                key={t}
                label={t}
                color={selectedTag === t ? 'success' : 'secondary'}
                sx={{ mr: 0.25 }}
              />
            ))}
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 90 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              <Typography
                variant="h5"
                component="p"
                sx={{
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.5,
                }}
              >
                "{quote.text || ''}"
              </Typography>

              <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'right' }}>
                — {quote.author || ''}
              </Typography>
            </>
          )}

          <Divider />

          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={selectedTag}
              onChange={(event) => setSelectedTag(event.target.value || '')}
              disabled={isLoading}
            >
              <MenuItem value=""><em>random</em></MenuItem>
              {tags.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>

            <Button
              fullWidth
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SkipNext />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
              onClick={() => loadRandomQuote(selectedTag || '')}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next Quote'}
            </Button>
          </Stack>

        </Stack>
      </CardContent>
    </Card>
  );
}
