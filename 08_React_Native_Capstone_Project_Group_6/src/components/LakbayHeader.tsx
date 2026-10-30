import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
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
  [70, 170, 1.2], [200, 190, 1], [330, 215, 1.3], [510, 190, 1], [640, 205, 1.2],
  [880, 190, 1], [990, 215, 1.4],
];

/** Island scene (light) / night sea (dark) drawn behind the header */
function Scene({ dark }: { dark: boolean }) {
  const island = dark ? '#0C2233' : '#8FB59C';
  const islandFar = dark ? '#133450' : '#B3CFBC';
  const wave = dark ? '#6C95B5' : '#FFFFFF';

  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1000 420" preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dark ? '#080F24' : '#F4ECDB'} />
          <Stop offset="1" stopColor={dark ? '#1A3A56' : '#EBF0E1'} />
        </LinearGradient>
        <LinearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dark ? '#12304A' : '#BEDCCF'} />
          <Stop offset="1" stopColor={dark ? '#07131F' : '#8FC4BB'} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={1000} height={420} fill="url(#sky)" />

      {dark ? (
        <>
          {STARS.map(([x, y, r], i) => (
            <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.55 + (i % 3) * 0.15} />
          ))}
          {/* moon + glow */}
          <Circle cx={850} cy={80} r={78} fill="#F4F1DC" opacity={0.05} />
          <Circle cx={850} cy={80} r={52} fill="#F4F1DC" opacity={0.1} />
          <Circle cx={850} cy={80} r={27} fill="#F6F3DF" />
          <Circle cx={841} cy={72} r={5} fill="#E3DFC2" opacity={0.7} />
          <Circle cx={860} cy={90} r={3.5} fill="#E3DFC2" opacity={0.6} />
        </>
      ) : (
        <>
          <Ellipse cx={170} cy={70} rx={70} ry={16} fill="#FFFFFF" opacity={0.55} />
          <Ellipse cx={215} cy={60} rx={42} ry={14} fill="#FFFFFF" opacity={0.55} />
          <Ellipse cx={800} cy={110} rx={80} ry={16} fill="#FFFFFF" opacity={0.5} />
          <Ellipse cx={850} cy={98} rx={44} ry={14} fill="#FFFFFF" opacity={0.5} />
        </>
      )}

      {/* sea */}
      <Rect x={0} y={300} width={1000} height={120} fill="url(#sea)" />

      {/* islands */}
      <Path d="M380 300 C 410 280, 450 272, 490 284 C 515 291, 530 296, 545 300 Z" fill={islandFar} />
      <Path d="M600 300 C 615 290, 640 286, 660 292 C 670 295, 676 298, 680 300 Z" fill={islandFar} />
      <Path d="M-20 300 C 40 255, 110 240, 170 262 C 210 276, 240 290, 270 300 Z" fill={island} />
      <Path d="M700 300 C 740 250, 810 232, 880 258 C 930 276, 975 290, 1020 300 Z" fill={island} />

      {/* moonlight on the water (dark) */}
      {dark && (
        <>
          <Line x1={815} y1={312} x2={885} y2={312} stroke="#F4F1DC" strokeWidth={3} opacity={0.4} strokeLinecap="round" />
          <Line x1={825} y1={330} x2={875} y2={330} stroke="#F4F1DC" strokeWidth={3} opacity={0.3} strokeLinecap="round" />
          <Line x1={832} y1={349} x2={868} y2={349} stroke="#F4F1DC" strokeWidth={3} opacity={0.22} strokeLinecap="round" />
          <Line x1={838} y1={369} x2={862} y2={369} stroke="#F4F1DC" strokeWidth={3} opacity={0.15} strokeLinecap="round" />
        </>
      )}

      {/* waves */}
      <Path d="M60 340 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.3 : 0.6} strokeLinecap="round" />
      <Path d="M300 365 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.25 : 0.55} strokeLinecap="round" />
      <Path d="M560 335 q15 -8 30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.25 : 0.55} strokeLinecap="round" />
      <Path d="M120 390 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.2 : 0.5} strokeLinecap="round" />
      <Path d="M700 385 q15 -8 30 0 t30 0 t30 0" stroke={wave} strokeWidth={2.5} fill="none" opacity={dark ? 0.2 : 0.5} strokeLinecap="round" />
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

/** Pill-shaped search tab that opens a searchable list */
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

      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <View style={[styles.modal, { backgroundColor: colors.paper }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.green }]}>{modalTitle}</Text>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={26} color={colors.green} />
            </Pressable>
          </View>

          <View style={[styles.modalSearch, { backgroundColor: colors.field, borderColor: colors.green }]}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.green} />
            <TextInput
              autoFocus
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

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={<Text style={[styles.modalEmpty, { color: colors.muted }]}>No matches found.</Text>}
            renderItem={({ item }) => (
              <TouchableRipple
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
            )}
          />
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

  return (
    <View style={[styles.wrap, { backgroundColor: c.paper }]}>
      <Scene dark={isDarkMode} />

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

      {wide && (
        <>
          <Polaroid
            source={isDarkMode ? polaroidLeftDark ?? polaroidLeft : polaroidLeft}
            caption={isDarkMode ? 'Even the nights are beautiful' : 'Same country, endless views'}
            tilt="-8deg"
            style={styles.polaroidLeft}
          />
          <Polaroid
            source={isDarkMode ? polaroidRightDark ?? polaroidRight : polaroidRight}
            caption={isDarkMode ? 'City lights, island nights' : "It's more fun in the Philippines"}
            tilt="6deg"
            style={styles.polaroidRight}
          />
        </>
      )}

      <View style={styles.center}>
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

        <View style={styles.tabs}>
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
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', paddingTop: 28, paddingBottom: 44, paddingHorizontal: 16 },
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
  center: { alignItems: 'center', width: '100%', maxWidth: 640, alignSelf: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  title: { fontSize: 44, fontWeight: '800', fontStyle: 'italic', letterSpacing: -1.5 },
  pin: { marginLeft: 2, marginTop: 6 },
  tagline: { textAlign: 'center', letterSpacing: 1, marginTop: 10, marginBottom: 18, paddingHorizontal: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 16 },
  chip: { borderRadius: 999 },
  chipInner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 9 },
  tabs: { width: '100%', gap: 12 },
  tab: { width: '100%', borderRadius: 999, borderWidth: 1.5 },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 5, paddingVertical: 5 },
  tabText: { flex: 1, fontSize: 16, paddingVertical: 8 },
  tabBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, paddingTop: 56, paddingHorizontal: 16 },
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
    position: 'absolute',
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
  polaroidLeft: { left: 20, top: 24 },
  polaroidRight: { right: 20, top: 70, width: 140 },
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