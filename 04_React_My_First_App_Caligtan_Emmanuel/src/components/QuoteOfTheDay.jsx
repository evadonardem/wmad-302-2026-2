import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Stack, Divider, Button, Chip, Box, Select, MenuItem } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { getRandomQuote, getTags } from '../services/quoteService';

export default function QuoteOfTheDay() {
  // TODO 1 [State Initialization]: Define local state variables for:
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState();

  // TODO 2 [Reference Hook]: Create a React mutable reference named 'selectTagRef' to capture the Select element value
  const selectTagRef = useRef();

  const loadRandomQuote = async () => {
    // TODO 3 [Async Request Handler]:
    const filteredTag = selectTagRef.current?.value || '';

    const newRandomQuote = await getRandomQuote(filteredTag);
    setQuote(newRandomQuote);
    setSelectedTag(filteredTag);
  };

  const loadTags = async () => {
    // TODO 4 [Async List Population]: Fetch tags asynchronously using 'getTags()' and store them into your tags state array
    const availableTags = await getTags();
    setTags(availableTags);
  };

  useEffect(() => {
    // TODO 5 [Component Lifecycle]: Execute both 'loadRandomQuote' and 'loadTags' when the component mounts
    (async () => {
      loadRandomQuote();
      loadTags();
    })();

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
      <CardContent sx={{ p: 4 , backgroundColor: '#fe86ee', color: '#000'}}>
        <Stack spacing={3}>
          <Typography variant="overline" color="text.secondary" letterSpacing={2} textAlign="center">
            Quote of the Day
          </Typography>

          <Box>
            {/* TODO 6 [Conditional Chip List]: Map through 'quote.tags'. For each tag 't': */}
            {quote.tags?.map((tag) => (
              <Chip key={tag} label={tag} sx={{ mr: 0.5,backgroundColor: '#ff7cac',color: '#000'}}
              />
            ))}
          </Box>

          {/* TODO 7 [Text Content Mapping]: Bind 'quote.text' directly inside the quotation marks below */}
          <Typography
            variant="h5"
            component="p"
            fontStyle="italic"
            textAlign="center"
            sx={{ fontWeight: '400', lineHeight: 1.5, fontStyle: 'italic' }}
          >
            "{quote.text}"
          </Typography>

          {/* TODO 8 [Author Content Mapping]: Bind 'quote.author' after the long dash separator symbol */}
          <Typography variant="subtitle1" textAlign="right" color="text.secondary">
            — {quote.author}
          </Typography>

          <Divider />

          <Stack direction="row" spacing={0.5} justifyContent="space-between" alignItems="center">
            {/* TODO 9 [Controlled Input Integration]: Attach your input reference 'selectTagRef' to this select component */}
            <Select
              inputRef={selectTagRef}
              fullWidth
              displayEmpty
              size="small"
            >
              <MenuItem value={null}><em>any</em></MenuItem>
              {/* TODO 10 [Select Option Generation]: Map through your 'tags' state array to render a <MenuItem> element for each tag 't' */}
              {tags.map((t) => <MenuItem key={t} value={t}> {t} </MenuItem>)}

            </Select>

            {/* TODO 11 [Action Trigger Binding]: Attach an interaction listener to trigger 'loadRandomQuote' upon click events */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              sx={{ borderRadius: 2, textTransform: 'none', color: '#050505', backgroundColor: '#fe84c5' }}
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