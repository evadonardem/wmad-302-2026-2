import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Stack, Divider, Button, Chip, Box, Select, MenuItem } from '@mui/material';
import {
  Refresh, FormatQuote, Favorite, WbSunny, Spa, Psychology, Bolt,
  EmojiEvents, Shield, EmojiEmotions, Lightbulb, DirectionsRun, Groups,
  MenuBook, Mood, Autorenew, NightsStay, AutoAwesome, HourglassEmpty,
  VolunteerActivism, School, Flight, Explore, Work, FitnessCenter,
  TrendingUp, AccessTime, SelfImprovement,
} from '@mui/icons-material';
import { getRandomQuote, getTags } from '../services/quoteService';

const TAG_ICONS = {
  love: Favorite,
  hope: WbSunny,
  life: Spa,
  wisdom: Psychology,
  motivation: Bolt,
  inspiration: Lightbulb,
  success: EmojiEvents,
  courage: Shield,
  happiness: EmojiEmotions,
  perseverance: DirectionsRun,
  leadership: Groups,
  friendship: Groups,
  philosophy: MenuBook,
  humor: Mood,
  failure: Autorenew,
  change: Autorenew,
  dreams: NightsStay,
  faith: AutoAwesome,
  patience: HourglassEmpty,
  gratitude: VolunteerActivism,
  knowledge: School,
  education: School,
  freedom: Flight,
  adventure: Explore,
  work: Work,
  discipline: FitnessCenter,
  strength: FitnessCenter,
  growth: TrendingUp,
  time: AccessTime,
  peace: SelfImprovement,
};

function getTagIcon(tag) {
  const Icon = TAG_ICONS[tag?.toLowerCase()] || FormatQuote;
  return <Icon sx={{ fontSize: '1rem !important' }} />;
}

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState({});
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectTagRef = useRef(null);

  const loadRandomQuote = async () => {
    setIsLoading(true);
    const tag = selectTagRef.current?.value || '';
    const data = await getRandomQuote(tag);
    setQuote(data);
    setSelectedTag(tag || null);
    setIsLoading(false);
  };

  const loadTags = async () => {
    const data = await getTags();
    setTags(data);
  };

  useEffect(() => {
    loadRandomQuote();
    loadTags();
  }, []);

  return (
    <Box sx={{ position: 'relative', maxWidth: 520, width: '100%', mt: 3 }}>
      {/* Ribbon tab */}
      <Box sx={{
        position: 'absolute',
        top: -14,
        left: 28,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        px: 2,
        py: 0.6,
        borderRadius: '4px 4px 10px 10px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: 0.3,
        boxShadow: 3,
        zIndex: 2,
      }}>
        Quote of the day
      </Box>

      <Card
        variant="elevation"
        elevation={5}
        sx={{
          width: '100%',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(92, 18, 17, 0.15)',
        }}
      >
        {/* Decorative oversized quotation mark */}
        <Typography
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -55,
            right: 4,
            fontFamily: "'Lora', serif",
            fontSize: 220,
            fontWeight: 600,
            color: 'error.main',
            opacity: 0.08,
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          "
        </Typography>

        <CardContent sx={{ p: 4, pt: 5, position: 'relative', zIndex: 1 }}>
          <Stack spacing={3} sx={{ minHeight: 220, justifyContent: isLoading ? 'center' : 'flex-start' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <Box className="quote-loader" role="status" aria-label="Loading quote">
                  <Box className="orbit-icon top" sx={{ color: '#A6302E' }}>
                    <FormatQuote sx={{ fontSize: 32 }} />
                  </Box>
                  <Box className="orbit-icon bottom" sx={{ color: '#14283C' }}>
                    <FormatQuote sx={{ fontSize: 32 }} />
                  </Box>
                </Box>
              </Box>
            ) : (
              <>
                <Box>
                  {quote.tags?.map((t) => (
                    <Chip
                key={t}
                icon={getTagIcon(t)}
                variant={selectedTag === t ? 'filled' : 'outlined'}
                color={selectedTag === t ? 'success' : 'secondary'}
                label={t}
                sx={{ mr: 0.5, mb: 0.5 }}
              />
                  ))}
                </Box>

                <Typography
                  variant="h5"
                  component="p"
                  textAlign="center"
                  sx={{
                    fontFamily: "'Lora', serif",
                    fontStyle: 'italic',
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: 'text.primary',
                  }}
                >
                  "{quote.text}"
                </Typography>

                <Typography
                  variant="subtitle1"
                  textAlign="right"
                  sx={{ fontFamily: "'Lora', serif", fontWeight: 600, color: 'secondary.main' }}
                >
                  — {quote.author}
                </Typography>
              </>
            )}

            <Divider />

            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Select
                fullWidth
                displayEmpty
                size="small"
                defaultValue=""
                inputRef={selectTagRef}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={null}><em>any</em></MenuItem>
                {tags.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Refresh />}
                onClick={loadRandomQuote}
                disabled={isLoading}
                sx={{ borderRadius: 999, textTransform: 'none', px: 3 }}
              >
                Next Quote
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}