import ThemeBackdrop from './components/ThemeBackdrop';

// ...inside return:
<Box sx={{ minHeight: '100vh', background: 'var(--page-bg)', py: 5 }}>
  <ThemeBackdrop isDarkMode={isDarkMode} />

  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
    <Paper
      /* ...all your existing Paper code stays here... */
    >
      {/* flag stripe, toggle button, title, subtitle, LocationForm */}
    </Paper>

    <MediaGallery photos={photos} loading={loading} />
  </Container>
</Box>