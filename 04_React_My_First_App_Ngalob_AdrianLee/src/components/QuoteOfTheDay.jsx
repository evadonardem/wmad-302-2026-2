import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { getRandomQuote, getTags } from '../services/quoteService';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const selectTagRef = useRef(null);

  const loadRandomQuote = async () => {
    setIsLoading(true);
    const tag = selectTagRef.current?.value ?? '';
    const nextQuote = await getRandomQuote(tag || null);
    setQuote(nextQuote);
    setSelectedTag(tag);
    setIsLoading(false);
  };

  useEffect(() => {
    const initialize = async () => {
      const [initialQuote, availableTags] = await Promise.all([
        getRandomQuote(),
        getTags(),
      ]);
      setQuote(initialQuote);
      setTags(availableTags);
      setIsLoading(false);
    };

    void initialize();
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
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 2, textAlign: 'center' }}
          >
            Quote of the Day
          </Typography>

          {quote.isFallback && (
            <Alert severity="info">
              The quote service is unavailable. Here&apos;s an offline quote instead.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
            {(quote.tags ?? []).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                color={selectedTag === tag ? 'success' : 'secondary'}
                sx={{ mr: 0.25 }}
              />
            ))}
          </Box>

          <Typography
            variant="h5"
            component="p"
            fontStyle="italic"
            sx={{ fontWeight: '400', lineHeight: 1.5, overflowWrap: 'anywhere', textAlign: 'center' }}
            aria-live="polite"
          >
            {isLoading ? <CircularProgress size={28} aria-label="Loading quote" /> : `“${quote.text}”`}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'right' }}>
            {!isLoading && `— ${quote.author}`}
          </Typography>

          <Divider />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: 'stretch' }}
          >
            <Select
              inputRef={selectTagRef}
              value={selectedTag}
              onChange={(event) => setSelectedTag(event.target.value)}
              fullWidth
              displayEmpty
              size="small"
              inputProps={{ 'aria-label': 'Filter quotes by category' }}
            >
              <MenuItem value=""><em>Any category</em></MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag} value={tag}>{tag}</MenuItem>
              ))}
            </Select>

            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => void loadRandomQuote()}
              disabled={isLoading}
              sx={{ borderRadius: 2, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {isLoading ? 'Loading…' : 'Next Quote'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
