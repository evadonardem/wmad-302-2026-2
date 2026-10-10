import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Stack, Divider, Button, Chip, Box, Select, MenuItem } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { getRandomQuote, getTags } from '../services/quoteService';

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const selectTagRef = useRef(null);

  const loadRandomQuote = async () => {
    const filterTag = selectTagRef.current?.value ?? selectedTag ?? null;
    const newRandomQuote = await getRandomQuote(filterTag);
    setQuote(newRandomQuote);
    setSelectedTag(filterTag || null);
  };

  const loadTags = async () => {
    const availableTags = await getTags();
    setTags(availableTags);
  };

  useEffect(() => {
    (async () => {
      await loadRandomQuote();
      await loadTags();
    })();
  }, []);

  return (
    <Card
      variant="elevation"
      elevation={5}
      sx={{
        maxWidth: 500,
        width: '100%',
        borderRadius: 3,
        backdropFilter: 'blur(8px)',
        boxShadow: (theme) => theme.shadows[8],
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="overline" color="text.secondary" letterSpacing={2} textAlign="center">
            Quote of the Day
          </Typography>

          <Box>
            {quote.tags?.map((tag) => (
              <Chip
                key={tag}
                color={selectedTag === tag ? 'success' : 'secondary'}
                label={tag}
                sx={{ mr: 0.25, mb: 0.5 }}
              />
            ))}
          </Box>

          <Typography
            variant="h5"
            component="p"
            fontStyle="italic"
            textAlign="center"
            sx={{ fontWeight: '400', lineHeight: 1.5 }}
          >
            "{quote.text}"
          </Typography>

          <Typography variant="subtitle1" textAlign="right" color="text.secondary">
            — {quote.author}
          </Typography>

          <Divider />

          <Stack direction="row" spacing={0.5} justifyContent="space-between" alignItems="center">
            <Select
              inputRef={selectTagRef}
              value={selectedTag ?? ''}
              onChange={(event) => setSelectedTag(event.target.value || null)}
              fullWidth
              displayEmpty
              size="small"
            >
              <MenuItem value=""><em>any</em></MenuItem>
              {tags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>

            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
              onClick={loadRandomQuote}
            >
              Next Quote
            </Button>
          </Stack>

        </Stack>
      </CardContent>
    </Card>
  );
}
