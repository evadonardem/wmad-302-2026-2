import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeMode } from '@/themeMode';
import type { City, Region } from '@/services/geoPhotoService';

export type IslandGroup = 'all' | 'luzon' | 'visayas' | 'mindanao';

const GROUPS: { key: IslandGroup; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'luzon', label: 'Luzon' },
  { key: 'visayas', label: 'Visayas' },
  { key: 'mindanao', label: 'Mindanao' },
];

type Props = {
  group: IslandGroup;
  onChangeGroup: (group: IslandGroup) => void;
  regions: Region[];
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
  citiesLoading?: boolean;
  polaroidLeft?: ImageSourcePropType;
  polaroidRight?: ImageSourcePropType;
  polaroidLeftDark?: ImageSourcePropType;
  polaroidRightDark?: ImageSourcePropType;
};

const LIGHT = {
  paper: '#F3EBDA',
  green: '#2F5D45',
  greenSoft: '#DDE3D0',
  field: '#FBF7EC',
  ink: '#2F5D45',
  muted: '#4F6B5B',
  onGreen: '#FFFFFF',
};
const DARK = {
  paper: '#0A1228',
  green: '#8FC7A6',
  greenSoft: '#22384A',
  field: '#142435',
  ink: '#D6E8F0',
  muted: '#9DB3C0',
  onGreen: '#0B1B14',
};
type Colors = typeof LIGHT;

const STARS: [number, number, number][] = [
  [40, 30, 1.4], [110, 80, 1], [170, 25, 1.6], [240, 110, 1], [300, 45, 1.2],
  [360, 140, 1], [420, 20, 1.5], [480, 95, 1], [540, 40, 1.3], [600, 130, 1],
  [660, 28, 1.6], [720, 85, 1], [770, 150, 1.2], [930, 40, 1.4], [960, 120, 1],
  [70, 170, 1.2], [200, 150, 1], [330, 165, 1.3], [510, 150, 1], [640, 160, 1.2],
  [880, 150, 1], [990, 165, 1.4],
];

// The artwork is 1000 x 420 and is fitted to the header HEIGHT. The 1000-wide tile is
// repeated sideways as far as needed, so any screen width is filled (the mountain ranges
// start and end at the same height, so the tiles join seamlessly).
const TILE_W = 1000;
const TILE_H = 420;
const HORIZON = 310;

// Two mountain ranges (far = lighter, near = darker). Both end at the same height
// they start at, so repeated tiles connect without a seam.
const FAR_RANGE =
  'M0 310 L0 255 L70 215 L120 245 L200 190 L270 240 L340 210 L420 250 L500 200 L580 245 ' +
  'L650 215 L730 255 L800 195 L880 240 L950 220 L1000 255 L1000 310 Z';
const NEAR_RANGE =
  'M0 310 L0 280 L90 235 L150 265 L240 215 L330 270 L410 245 L480 280 L570 225 L660 275 ' +
  'L740 240 L830 280 L920 232 L1000 280 L1000 310 Z';

/** Light: sun + mountains + sea. Dark: moon + mountains + sea. Drawn behind the header. */
function Scene({ dark, width, height }: { dark: boolean; width: number; height: number }) {
  const farColor = dark ? '#15324D' : '#B7D1BF';
  const nearColor = dark ? '#0B2133' : '#7FA98D';
  const wave = dark ? '#6C95B5' : '#FFFFFF';

  const scale = height > 0 && width > 0 ? height / TILE_H : 0;
  const visibleW = scale > 0 ? width / scale : TILE_W;
  const vbX = TILE_W / 2 - visibleW / 2;
  const viewBox = `${vbX} 0 ${visibleW} ${TILE_H}`;

  // which tiles are needed to cover the visible area
  const firstTile = Math.floor(vbX / TILE_W);
  const lastTile = Math.floor((vbX + visibleW) / TILE_W);
  const tiles: number[] = [];
  for (let k = firstTile; k <= lastTile; k++) tiles.push(k);

  // sun / moon sits near the right edge of what is actually visible (works on phones too)
  const bodyX = TILE_W / 2 + visibleW / 2 - Math.min(150, Math.max(70, visibleW * 0.16));
  const bodyY = 92;

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox={viewBox} preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dark ? '#080F24' : '#F9E7C4'} />
          <Stop offset="1" stopColor={dark ? '#1A3A56' : '#EEF2E3'} />
        </LinearGradient>
        <LinearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dark ? '#12304A' : '#BEDCCF'} />
          <Stop offset="1" stopColor={dark ? '#07131F' : '#8FC4BB'} />
        </LinearGradient>
        <LinearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dark ? '#1A3A56' : '#FFFFFF'} stopOpacity={0} />
          <Stop offset="1" stopColor={dark ? '#1A3A56' : '#FFFFFF'} stopOpacity={dark ? 0.35 : 0.45} />
        </LinearGradient>
      </Defs>

      {/* sky + sea span the whole visible width */}
      <Rect x={vbX - 200} y={0} width={visibleW + 400} height={TILE_H} fill="url(#sky)" />

      {/* sun (light) or moon (dark): one copy, drawn behind the mountains */}
      {dark ? (
        <>
          <Circle cx={bodyX} cy={bodyY} r={80} fill="#F4F1DC" opacity={0.05} />
          <Circle cx={bodyX} cy={bodyY} r={54} fill="#F4F1DC" opacity={0.1} />
          <Circle cx={bodyX} cy={bodyY} r={30} fill="#F6F3DF" />
          <Circle cx={bodyX - 9} cy={bodyY - 8} r={5.5} fill="#E3DFC2" opacity={0.7} />
          <Circle cx={bodyX + 10} cy={bodyY + 10} r={3.8} fill="#E3DFC2" opacity={0.6} />
          <Circle cx={bodyX + 8} cy={bodyY - 14} r={2.6} fill="#E3DFC2" opacity={0.55} />
        </>
      ) : (
        <>
          <Circle cx={bodyX} cy={bodyY} r={84} fill="#FFC857" opacity={0.14} />
          <Circle cx={bodyX} cy={bodyY} r={58} fill="#FFC857" opacity={0.26} />
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r1 = 44;
            const r2 = i % 2 ? 58 : 68;
            return (
              <Line
                key={i}
                x1={bodyX + Math.cos(a) * r1}
                y1={bodyY + Math.sin(a) * r1}
                x2={bodyX + Math.cos(a) * r2}
                y2={bodyY + Math.sin(a) * r2}
                stroke="#FFB938"
                strokeWidth={3.5}
                strokeLinecap="round"
                opacity={0.75}
              />
            );
          })}
          <Circle cx={bodyX} cy={bodyY} r={34} fill="#FFB938" />
          <Circle cx={bodyX} cy={bodyY} r={26} fill="#FFD36B" opacity={0.7} />
        </>
      )}

      {tiles.map((k) => (
        <G key={k} transform={`translate(${k * TILE_W} 0)`}>
          {dark ? (
            <>
              {STARS.map(([x, y, r], i) => (
                <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.55 + (i % 3) * 0.15} />
              ))}
            </>
          ) : (
            <>
              <Ellipse cx={170} cy={70} rx={70} ry={16} fill="#FFFFFF" opacity={0.6} />
              <Ellipse cx={215} cy={60} rx={42} ry={14} fill="#FFFFFF" opacity={0.6} />
              <Ellipse cx={620} cy={120} rx={64} ry={13} fill="#FFFFFF" opacity={0.5} />
              <Ellipse cx={660} cy={110} rx={38} ry={11} fill="#FFFFFF" opacity={0.5} />
            </>
          )}

          {/* mountains: far range, then near range */}
          <Path d={FAR_RANGE} fill={farColor} />
          <Path d={NEAR_RANGE} fill={nearColor} />
        </G>
      ))}

      {/* mist where the mountains meet the sea */}
      <Rect x={vbX - 200} y={HORIZON - 55} width={visibleW + 400} height={55} fill="url(#haze)" />

      {/* sea */}
      <Rect x={vbX - 200} y={HORIZON} width={visibleW + 400} height={TILE_H - HORIZON} fill="url(#sea)" />

      {/* sun / moon reflection on the water */}
      {[
        [70, 0.5], [54, 0.4], [40, 0.3], [26, 0.22],
      ].map(([w, o], i) => (
        <Line
          key={i}
          x1={bodyX - (w as number)}
          y1={HORIZON + 14 + i * 20}
          x2={bodyX + (w as number)}
          y2={HORIZON + 14 + i * 20}
          stroke={dark ? '#F4F1DC' : '#FFF1C2'}
          strokeWidth={3}
          opacity={(o as number) * (dark ? 0.8 : 1)}
          strokeLinecap="round"
        />
      ))}

      {tiles.map((k) => (
        <G key={`w${k}`} transform={`translate(${k * TILE_W} 0)`}>
          <Path d="M60 340 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.3 : 0.6} strokeLinecap="round" />
          <Path d="M300 362 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.25 : 0.55} strokeLinecap="round" />
          <Path d="M560 335 q15 -8 30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.25 : 0.55} strokeLinecap="round" />
          <Path d="M120 392 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.2 : 0.5} strokeLinecap="round" />
          <Path d="M720 385 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.2 : 0.5} strokeLinecap="round" />
          <Path d="M430 400 q15 -8 30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.2 : 0.5} strokeLinecap="round" />
        </G>
      ))}
    </Svg>
  );
}

function Polaroid({ source, caption, tilt, style }: { source?: ImageSourcePropType; caption: string; tilt: string; style?: object }) {
  return (
    <View style={[styles.polaroid, { transform: [{ rotate: tilt }] }, style]}>
      <View style={styles.polaroidPhoto}>
        {source ? (
          <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#8CCFC4' }]} />
        )}
      </View>
      <Text style={styles.polaroidCaption}>{caption} ♡</Text>
      <View style={styles.tape} />
    </View>
  );
}

function SunAndMountains({ color }: { color: string }) {
  return (
    <Svg width={230} height={96} viewBox="0 0 230 96" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <Circle cx={92} cy={22} r={9} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <Line
            key={deg}
            x1={92 + Math.cos(r) * 15}
            y1={22 + Math.sin(r) * 15}
            x2={92 + Math.cos(r) * 21}
            y2={22 + Math.sin(r) * 21}
          />
        );
      })}
      <Path d="M8 88 L52 52 L68 64 L118 30 L168 62 L186 52 L222 88" />
      <Path d="M70 80 C 100 74, 130 82, 160 76" />
    </Svg>
  );
}

function Swoosh({ color, width }: { color: string; width: number }) {
  return (
    <Svg width={width} height={16} viewBox="0 0 300 16" preserveAspectRatio="none" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
      <Path d="M4 10 C 70 16, 200 14, 296 2" />
    </Svg>
  );
}

/** Pill-shaped search tab that opens a searchable list (compact, centered, scrollable card) */
function SearchTab<T extends { code: string }>({
  icon,
  placeholder,
  modalTitle,
  valueLabel,
  items,
  getLabel,
  getSubLabel,
  onSelect,
  disabled,
  loading,
  colors,
}: {
  icon: string;
  placeholder: string;
  modalTitle: string;
  valueLabel?: string;
  items: T[];
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string | undefined;
  onSelect: (item: T) => void;
  disabled?: boolean;
  loading?: boolean;
  colors: Colors;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const { height } = useWindowDimensions();

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => `${getLabel(item)} ${getSubLabel?.(item) ?? ''}`.toLowerCase().includes(term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filter]);

  const close = () => {
    setOpen(false);
    setFilter('');
  };

  return (
    <>
      <TouchableRipple
        disabled={disabled}
        onPress={() => setOpen(true)}
        borderless
        style={[styles.tab, { borderColor: colors.green, backgroundColor: colors.field, opacity: disabled ? 0.55 : 1 }]}
      >
        <View style={styles.tabInner}>
          <MaterialCommunityIcons name={icon as any} size={22} color={colors.green} />
          <Text numberOfLines={1} style={[styles.tabText, { color: valueLabel ? colors.ink : colors.muted }]}>
            {valueLabel ?? placeholder}
          </Text>
          <View style={[styles.tabBtn, { backgroundColor: colors.green }]}>
            {loading ? (
              <ActivityIndicator size={16} color={colors.onGreen} />
            ) : (
              <MaterialCommunityIcons name="magnify" size={20} color={colors.onGreen} />
            )}
          </View>
        </View>
      </TouchableRipple>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          {/* Tap outside the card to close */}
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />

          <View style={[styles.modalCard, { backgroundColor: colors.paper, height: Math.min(height * 0.7, 480) }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.green }]}>{modalTitle}</Text>
              <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
                <MaterialCommunityIcons name="close" size={26} color={colors.green} />
              </Pressable>
            </View>

            <View style={[styles.modalSearch, { backgroundColor: colors.field, borderColor: colors.green }]}>
              <MaterialCommunityIcons name="magnify" size={22} color={colors.green} />
              <TextInput
                value={filter}
                onChangeText={setFilter}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                style={[styles.modalInput, { color: colors.ink }]}
              />
              {filter.length > 0 && (
                <Pressable onPress={() => setFilter('')} hitSlop={10}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={colors.muted} />
                </Pressable>
              )}
            </View>

            {/* flex: 1 + minHeight: 0 lets the list shrink to the space left in the card and scroll */}
            <View style={{ flex: 1, minHeight: 0 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {filtered.length === 0 ? (
                  <Text style={[styles.modalEmpty, { color: colors.muted }]}>No matches found.</Text>
                ) : (
                  filtered.map((item) => (
                    <TouchableRipple
                      key={item.code}
                      onPress={() => {
                        onSelect(item);
                        close();
                      }}
                      style={[styles.modalRow, { borderBottomColor: colors.greenSoft }]}
                    >
                      <View>
                        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '600' }}>{getLabel(item)}</Text>
                        {getSubLabel?.(item) ? <Text style={{ color: colors.muted, fontSize: 13 }}>{getSubLabel(item)}</Text> : null}
                      </View>
                    </TouchableRipple>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function LakbayHeader({
  group,
  onChangeGroup,
  regions,
  selectedRegion,
  onSelectRegion,
  cities,
  selectedCity,
  onSelectCity,
  citiesLoading,
  polaroidLeft,
  polaroidRight,
  polaroidLeftDark,
  polaroidRightDark,
}: Props) {
  const theme = useTheme();
  const { isDarkMode, setIsDarkMode } = useThemeMode();
  const c = isDarkMode ? DARK : LIGHT;
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  // Measured header size, so the scene can decide how to fit itself
  const [size, setSize] = useState({ w: 0, h: 0 });

  return (
    <View
      style={[styles.wrap, { backgroundColor: c.paper, paddingBottom: wide ? 28 : 44 }]}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      <Scene dark={isDarkMode} width={size.w} height={size.h} />

      {/* Dark mode toggle */}
      <TouchableRipple
        onPress={() => setIsDarkMode((v) => !v)}
        borderless
        accessibilityRole="button"
        accessibilityLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        style={[styles.toggle, { backgroundColor: c.field, borderColor: c.green }]}
      >
        <MaterialCommunityIcons
          name={isDarkMode ? 'white-balance-sunny' : 'weather-night'}
          size={22}
          color={c.green}
        />
      </TouchableRipple>

      <View style={[styles.stage, wide && styles.stageWide]}>
        {wide && (
          <Polaroid
            source={isDarkMode ? polaroidLeftDark ?? polaroidLeft : polaroidLeft}
            caption={isDarkMode ? 'Even the nights are beautiful' : 'Same country, endless views'}
            tilt="-8deg"
            style={styles.polaroidLeft}
          />
        )}

        <View style={[styles.center, wide && styles.centerWide]}>
          <SunAndMountains color={c.green} />

          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.green }]}>PH Lakbay PH</Text>
            <MaterialCommunityIcons name="map-marker" size={30} color={c.green} style={styles.pin} />
          </View>
          <Swoosh color={c.green} width={Math.min(width - 80, 360)} />

          <Text style={[styles.tagline, { color: c.muted }]}>
            Explore tourist spots across regions, cities, and municipalities in the Philippines
          </Text>

          <View style={styles.chips}>
            {GROUPS.map(({ key, label }) => {
              const active = key === group;
              return (
                <TouchableRipple
                  key={key}
                  onPress={() => onChangeGroup(key)}
                  borderless
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, { backgroundColor: active ? c.green : c.greenSoft }]}
                >
                  <View style={styles.chipInner}>
                    {active && <MaterialCommunityIcons name="check" size={16} color={c.onGreen} />}
                    <Text style={{ color: active ? c.onGreen : c.ink, fontWeight: '600' }}>{label}</Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>

          <View style={[styles.tabs, wide && styles.tabsWide]}>
            <View style={wide ? styles.tabSlot : undefined}>
              <SearchTab<Region>
                icon="map-outline"
                placeholder="Search region..."
                modalTitle="Select a region"
                valueLabel={selectedRegion ? selectedRegion.regionName : undefined}
                items={regions}
                getLabel={(r) => r.regionName}
                getSubLabel={(r) => r.name}
                onSelect={onSelectRegion}
                colors={c}
              />
            </View>
            <View style={wide ? styles.tabSlot : undefined}>
              <SearchTab<City>
                icon="city-variant-outline"
                placeholder="Search city / municipality..."
                modalTitle="Select a city or municipality"
                valueLabel={selectedCity ? selectedCity.name : undefined}
                items={cities}
                getLabel={(city) => city.name}
                getSubLabel={(city) => (city.isMunicipality ? 'Municipality' : 'City')}
                onSelect={onSelectCity}
                disabled={!selectedRegion}
                loading={citiesLoading}
                colors={c}
              />
            </View>
          </View>
        </View>

        {wide && (
          <Polaroid
            source={isDarkMode ? polaroidRightDark ?? polaroidRight : polaroidRight}
            caption={isDarkMode ? 'City lights, island nights' : "It's more fun in the Philippines"}
            tilt="6deg"
            style={styles.polaroidRight}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', paddingTop: 24, paddingBottom: 44, paddingHorizontal: 16 },
  toggle: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stage: { width: '100%', alignItems: 'center' },
  stageWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 1100,
    alignSelf: 'center',
  },
  center: { alignItems: 'center', width: '100%', maxWidth: 640, alignSelf: 'center', flexShrink: 1 },
  centerWide: { maxWidth: 720, flex: 1 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  title: { fontSize: 44, fontWeight: '800', fontStyle: 'italic', letterSpacing: -1.5 },
  pin: { marginLeft: 2, marginTop: 6 },
  tagline: { textAlign: 'center', letterSpacing: 1, marginTop: 10, marginBottom: 18, paddingHorizontal: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 16 },
  chip: { borderRadius: 999 },
  chipInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 9 },

  tabs: { width: '100%', gap: 12 },
  tabsWide: { flexDirection: 'row' },
  tabSlot: { flex: 1 },
  tab: { width: '100%', borderRadius: 999, borderWidth: 1.5 },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 5, paddingVertical: 5 },
  tabText: { flex: 1, fontSize: 16, paddingVertical: 8 },
  tabBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalInput: { flex: 1, fontSize: 16, paddingVertical: 12 },
  modalRow: { paddingVertical: 14, paddingHorizontal: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  modalEmpty: { textAlign: 'center', marginTop: 32 },

  polaroid: {
    width: 150,
    padding: 7,
    paddingBottom: 12,
    backgroundColor: '#FBF7EC',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  polaroidPhoto: { height: 100, borderRadius: 2, overflow: 'hidden' },
  polaroidCaption: { fontStyle: 'italic', fontSize: 12, color: '#4A5A50', marginTop: 8 },
  // polaroids sit in the row beside the title instead of at the screen edges
  polaroidLeft: { marginTop: 16 },
  polaroidRight: { marginTop: 56, width: 140 },
  tape: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    left: 45,
    width: 56,
    height: 16,
    backgroundColor: 'rgba(214,190,150,0.7)',
    transform: [{ rotate: '-4deg' }],
  },
});