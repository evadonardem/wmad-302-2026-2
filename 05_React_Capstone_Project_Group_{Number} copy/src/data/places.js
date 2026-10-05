// Region, province and tourist-spot data used by the search form and gallery.
// Sample data: verify names before publishing, and extend it as you like.

export const FEATURED = [
  {
    "name": "Palawan",
    "tags": [
      "Beaches",
      "Diving"
    ],
    "rating": 4.9,
    "best": "Nov–May",
    "budget": "₱₱₱",
    "description": "El Nido lagoons, Coron wrecks, and the Underground River.",
    "highlights": [
      "Island-hopping Tours A–D",
      "Wreck diving in Coron",
      "Puerto Princesa Underground River"
    ],
    "location": "El Nido, Palawan",
    "howToGetThere": "Fly Manila to El Nido (Lio) or Puerto Princesa, then a 5–6 hr van ride.",
    "region": "IV-B"
  },
  {
    "name": "Siargao",
    "tags": [
      "Beaches",
      "Adventure"
    ],
    "rating": 4.8,
    "best": "Mar–Oct",
    "budget": "₱₱",
    "description": "Surf capital with tidal pools, palm roads, and island hops.",
    "highlights": [
      "Cloud 9 surf break",
      "Sugba Lagoon",
      "Naked, Daku and Guyam islands"
    ],
    "location": "General Luna, Siargao",
    "howToGetThere": "Fly to Siargao (IAO) from Manila or Cebu, about 45 min to General Luna.",
    "region": "XIII"
  },
  {
    "name": "Boracay",
    "tags": [
      "Beaches"
    ],
    "rating": 4.6,
    "best": "Nov–Apr",
    "budget": "₱₱₱",
    "description": "Famous white-sand beach with sunsets and water sports.",
    "highlights": [
      "White Beach sunsets",
      "Puka Shell Beach",
      "Island-hopping by paraw"
    ],
    "location": "White Beach, Boracay",
    "howToGetThere": "Fly to Caticlan, then a short boat ride to the island.",
    "region": "VI"
  },
  {
    "name": "Cebu",
    "tags": [
      "Diving",
      "Culture"
    ],
    "rating": 4.7,
    "best": "Dec–May",
    "budget": "₱₱",
    "description": "Colonial history, big-city food, and whale shark diving.",
    "highlights": [
      "Basilica del Santo Niño",
      "Kawasan Falls",
      "Oslob and Moalboal diving"
    ],
    "location": "Cebu City, Cebu",
    "howToGetThere": "Direct flights to Mactan-Cebu Airport from most major cities.",
    "region": "VII"
  },
  {
    "name": "Bohol",
    "tags": [
      "Nature",
      "Culture"
    ],
    "rating": 4.7,
    "best": "Dec–May",
    "budget": "₱₱",
    "description": "Chocolate Hills, tarsiers, and the Loboc River.",
    "highlights": [
      "Chocolate Hills",
      "Tarsier sanctuary",
      "Panglao beaches"
    ],
    "location": "Panglao, Bohol",
    "howToGetThere": "Fly to Bohol-Panglao Airport or take a 2 hr ferry from Cebu.",
    "region": "VII"
  },
  {
    "name": "Batanes",
    "tags": [
      "Nature",
      "Culture"
    ],
    "rating": 4.9,
    "best": "Mar–Jun",
    "budget": "₱₱₱",
    "description": "Rolling hills, stone houses, and lighthouses at the northern edge.",
    "highlights": [
      "Basco Lighthouse",
      "Sabtang stone villages",
      "Marlboro Country hills"
    ],
    "location": "Basco, Batanes",
    "howToGetThere": "Fly from Manila or Tuguegarao to Basco, about 1.5 hrs.",
    "region": "II"
  },
  {
    "name": "Zambales",
    "tags": [
      "Beaches",
      "Adventure"
    ],
    "rating": 4.5,
    "best": "Nov–May",
    "budget": "₱",
    "description": "Pristine coves, camping beaches, island hopping, and surfing.",
    "highlights": [
      "Anawangin Cove",
      "Capones Island",
      "San Narciso surf"
    ],
    "location": "Anawangin Cove, Zambales",
    "howToGetThere": "Bus to Pundaquit, San Antonio, then a short boat ride or hike.",
    "region": "III"
  },
  {
    "name": "Baguio",
    "tags": [
      "Nature",
      "Culture"
    ],
    "rating": 4.4,
    "best": "Dec–Feb",
    "budget": "₱",
    "description": "Cool mountain city with pine forests, markets, and art.",
    "highlights": [
      "Burnham Park",
      "Session Road food crawl",
      "Mines View Park"
    ],
    "location": "Burnham Park, Baguio",
    "howToGetThere": "Bus from Manila, 5–6 hrs via NLEX–SCTEX–TPLEX.",
    "region": "CAR"
  },
  {
    "name": "Davao",
    "tags": [
      "Nature",
      "Adventure"
    ],
    "rating": 4.5,
    "best": "Mar–Oct",
    "budget": "₱₱",
    "description": "Gateway to Mt. Apo, eagle sanctuary, and fresh durian.",
    "highlights": [
      "Philippine Eagle Center",
      "Samal Island",
      "Mt. Apo trek"
    ],
    "location": "Davao City, Davao del Sur",
    "howToGetThere": "Fly to Francisco Bangoy Airport, about 2 hrs from Manila.",
    "region": "XI"
  }
];

export const PROVINCES = [
  {"name":"Manila","region":"NCR","featured":null,"spots":[{"name":"Intramuros","type":"Culture","desc":"Heritage and cultural site in Manila.","area":"Manila"},{"name":"Rizal Park","type":"Nature","desc":"Natural attraction in Manila.","area":"Manila"}]},
  {"name":"Quezon City","region":"NCR","featured":null,"spots":[{"name":"La Mesa Eco Park","type":"Nature","desc":"Natural attraction in Quezon City.","area":"Quezon City"},{"name":"Quezon Memorial Circle","type":"Culture","desc":"Heritage and cultural site in Quezon City.","area":"Quezon City"}]},
  {"name":"Makati","region":"NCR","featured":null,"spots":[{"name":"Ayala Museum","type":"Culture","desc":"Heritage and cultural site in Makati.","area":"Makati"},{"name":"Greenbelt Park","type":"Nature","desc":"Natural attraction in Makati.","area":"Makati"}]},
  {"name":"Pasay","region":"NCR","featured":null,"spots":[{"name":"SM Mall of Asia Seaside","type":"Culture","desc":"Heritage and cultural site in Pasay.","area":"Pasay"}]},
  {"name":"Taguig","region":"NCR","featured":null,"spots":[{"name":"Bonifacio High Street","type":"Culture","desc":"Heritage and cultural site in Taguig.","area":"Taguig"}]},
  {"name":"Abra","region":"CAR","featured":null,"spots":[{"name":"Kaparkan Falls","type":"Nature","desc":"Natural attraction in Abra.","area":"Abra"},{"name":"Tayum Church","type":"Culture","desc":"Heritage and cultural site in Abra.","area":"Abra"}]},
  {"name":"Apayao","region":"CAR","featured":null,"spots":[]},
  {"name":"Benguet","region":"CAR","featured":"Baguio","spots":[{"name":"Burnham Park","type":"Nature","desc":"Central park with boating, biking and picnic lawns.","area":"Baguio"},{"name":"Session Road","type":"Culture","desc":"Main street for cafes, shops and local food.","area":"Baguio"},{"name":"Mines View Park","type":"Nature","desc":"Lookout over the mountains and the old mining area.","area":"Baguio"},{"name":"Baguio Cathedral","type":"Culture","desc":"Pink twin-spired church above Session Road.","area":"Baguio"},{"name":"Wright Park","type":"Nature","desc":"Pine-lined park known for horseback rides.","area":"Baguio"},{"name":"Tam-awan Village","type":"Culture","desc":"Reconstructed Cordillera village with art studios.","area":"Baguio"},{"name":"Camp John Hay","type":"Adventure","desc":"Pine forest with trails, zip lines and dining.","area":"Baguio"},{"name":"Mount Pulag","type":"Adventure","desc":"Outdoor adventure spot in Benguet.","area":"Benguet"},{"name":"Kabayan Mummy Caves","type":"Culture","desc":"Heritage and cultural site in Benguet.","area":"Benguet"}]},
  {"name":"Ifugao","region":"CAR","featured":null,"spots":[{"name":"Banaue Rice Terraces","type":"Nature","desc":"Natural attraction in Ifugao.","area":"Ifugao"},{"name":"Batad Rice Terraces","type":"Nature","desc":"Natural attraction in Ifugao.","area":"Ifugao"}]},
  {"name":"Kalinga","region":"CAR","featured":null,"spots":[{"name":"Buscalan Village","type":"Culture","desc":"Heritage and cultural site in Kalinga.","area":"Kalinga"}]},
  {"name":"Mountain Province","region":"CAR","featured":null,"spots":[{"name":"Sagada Hanging Coffins","type":"Culture","desc":"Heritage and cultural site in Mountain Province.","area":"Mountain Province"},{"name":"Sumaguing Cave","type":"Adventure","desc":"Outdoor adventure spot in Mountain Province.","area":"Mountain Province"},{"name":"Bomod-ok Falls","type":"Nature","desc":"Natural attraction in Mountain Province.","area":"Mountain Province"}]},
  {"name":"Ilocos Norte","region":"I","featured":null,"spots":[{"name":"Saud Beach","type":"Beaches","desc":"Beach destination in Ilocos Norte.","area":"Ilocos Norte"},{"name":"Bangui Windmills","type":"Nature","desc":"Natural attraction in Ilocos Norte.","area":"Ilocos Norte"},{"name":"Paoay Church","type":"Culture","desc":"Heritage and cultural site in Ilocos Norte.","area":"Ilocos Norte"}]},
  {"name":"Ilocos Sur","region":"I","featured":null,"spots":[{"name":"Vigan Heritage Village","type":"Culture","desc":"Heritage and cultural site in Ilocos Sur.","area":"Ilocos Sur"},{"name":"Calle Crisologo","type":"Culture","desc":"Heritage and cultural site in Ilocos Sur.","area":"Ilocos Sur"}]},
  {"name":"La Union","region":"I","featured":null,"spots":[{"name":"San Juan Surf Beach","type":"Adventure","desc":"Outdoor adventure spot in La Union.","area":"La Union"},{"name":"Tangadan Falls","type":"Nature","desc":"Natural attraction in La Union.","area":"La Union"}]},
  {"name":"Pangasinan","region":"I","featured":null,"spots":[{"name":"Hundred Islands","type":"Nature","desc":"Natural attraction in Pangasinan.","area":"Pangasinan"},{"name":"Patar Beach","type":"Beaches","desc":"Beach destination in Pangasinan.","area":"Pangasinan"}]},
  {"name":"Batanes","region":"II","featured":"Batanes","spots":[{"name":"Basco Lighthouse","type":"Culture","desc":"Hilltop lighthouse with views over Basco and the sea.","area":"Batanes"},{"name":"Sabtang Island","type":"Culture","desc":"Stone houses and traditional villages.","area":"Batanes"},{"name":"Valugan Boulder Beach","type":"Nature","desc":"A coast covered in round volcanic boulders.","area":"Batanes"},{"name":"Marlboro Country","type":"Nature","desc":"Rolling pastures where cattle graze beside the sea.","area":"Batanes"},{"name":"Vayang Rolling Hills","type":"Nature","desc":"Green hills with views of Mount Iraya.","area":"Batanes"},{"name":"Tukon Chapel","type":"Culture","desc":"Tiny hilltop chapel with a panoramic view.","area":"Batanes"}]},
  {"name":"Cagayan","region":"II","featured":null,"spots":[{"name":"Callao Cave","type":"Nature","desc":"Natural attraction in Cagayan.","area":"Cagayan"},{"name":"Palaui Island","type":"Beaches","desc":"Beach destination in Cagayan.","area":"Cagayan"}]},
  {"name":"Isabela","region":"II","featured":null,"spots":[{"name":"Fuyot Spring National Park","type":"Nature","desc":"Natural attraction in Isabela.","area":"Isabela"}]},
  {"name":"Nueva Vizcaya","region":"II","featured":null,"spots":[{"name":"Capisaan Cave","type":"Adventure","desc":"Outdoor adventure spot in Nueva Vizcaya.","area":"Nueva Vizcaya"}]},
  {"name":"Quirino","region":"II","featured":null,"spots":[{"name":"Aglipay Caves","type":"Adventure","desc":"Outdoor adventure spot in Quirino.","area":"Quirino"}]},
  {"name":"Aurora","region":"III","featured":null,"spots":[{"name":"Sabang Beach","type":"Adventure","desc":"Outdoor adventure spot in Aurora.","area":"Aurora"},{"name":"Ditumabo Mother Falls","type":"Nature","desc":"Natural attraction in Aurora.","area":"Aurora"}]},
  {"name":"Bataan","region":"III","featured":null,"spots":[{"name":"Mount Samat Shrine","type":"Culture","desc":"Heritage and cultural site in Bataan.","area":"Bataan"},{"name":"Las Casas Filipinas de Acuzar","type":"Culture","desc":"Heritage and cultural site in Bataan.","area":"Bataan"}]},
  {"name":"Bulacan","region":"III","featured":null,"spots":[{"name":"Barasoain Church","type":"Culture","desc":"Heritage and cultural site in Bulacan.","area":"Bulacan"},{"name":"Biak-na-Bato National Park","type":"Nature","desc":"Natural attraction in Bulacan.","area":"Bulacan"}]},
  {"name":"Nueva Ecija","region":"III","featured":null,"spots":[{"name":"Pantabangan Dam","type":"Nature","desc":"Natural attraction in Nueva Ecija.","area":"Nueva Ecija"}]},
  {"name":"Pampanga","region":"III","featured":null,"spots":[{"name":"Mount Arayat","type":"Adventure","desc":"Outdoor adventure spot in Pampanga.","area":"Pampanga"},{"name":"Betis Church","type":"Culture","desc":"Heritage and cultural site in Pampanga.","area":"Pampanga"}]},
  {"name":"Tarlac","region":"III","featured":null,"spots":[{"name":"Mount Pinatubo Crater","type":"Adventure","desc":"Outdoor adventure spot in Tarlac.","area":"Tarlac"},{"name":"Monasterio de Tarlac","type":"Culture","desc":"Heritage and cultural site in Tarlac.","area":"Tarlac"}]},
  {"name":"Zambales","region":"III","featured":"Zambales","spots":[{"name":"Anawangin Cove","type":"Beaches","desc":"Pine-lined cove that is great for camping.","area":"Zambales"},{"name":"Nagsasa Cove","type":"Beaches","desc":"Quieter cove with a sandy beach and a river.","area":"Zambales"},{"name":"Capones Island","type":"Nature","desc":"Island with a lighthouse and rock formations.","area":"Zambales"},{"name":"Potipot Island","type":"Beaches","desc":"Small island with white sand and shallow water.","area":"Zambales"},{"name":"Liwa Beach","type":"Adventure","desc":"Surf spot in San Narciso with steady waves.","area":"Zambales"},{"name":"Pundaquit","type":"Culture","desc":"Fishing village and boat departure point for the coves.","area":"Zambales"}]},
  {"name":"Batangas","region":"IV-A","featured":null,"spots":[{"name":"Taal Volcano","type":"Nature","desc":"Natural attraction in Batangas.","area":"Batangas"},{"name":"Anilao","type":"Diving","desc":"Dive and snorkel spot in Batangas.","area":"Batangas"}]},
  {"name":"Cavite","region":"IV-A","featured":null,"spots":[{"name":"Tagaytay Picnic Grove","type":"Nature","desc":"Natural attraction in Cavite.","area":"Cavite"},{"name":"Aguinaldo Shrine","type":"Culture","desc":"Heritage and cultural site in Cavite.","area":"Cavite"}]},
  {"name":"Laguna","region":"IV-A","featured":null,"spots":[{"name":"Pagsanjan Falls","type":"Adventure","desc":"Outdoor adventure spot in Laguna.","area":"Laguna"},{"name":"Hidden Valley Springs","type":"Nature","desc":"Natural attraction in Laguna.","area":"Laguna"}]},
  {"name":"Quezon","region":"IV-A","featured":null,"spots":[{"name":"Kamay ni Hesus","type":"Culture","desc":"Heritage and cultural site in Quezon.","area":"Quezon"},{"name":"Borawan Beach","type":"Beaches","desc":"Beach destination in Quezon.","area":"Quezon"}]},
  {"name":"Rizal","region":"IV-A","featured":null,"spots":[{"name":"Daranak Falls","type":"Nature","desc":"Natural attraction in Rizal.","area":"Rizal"},{"name":"Mount Daraitan","type":"Adventure","desc":"Outdoor adventure spot in Rizal.","area":"Rizal"}]},
  {"name":"Marinduque","region":"IV-B","featured":null,"spots":[{"name":"Poctoy White Beach","type":"Beaches","desc":"Beach destination in Marinduque.","area":"Marinduque"}]},
  {"name":"Occidental Mindoro","region":"IV-B","featured":null,"spots":[{"name":"Apo Reef","type":"Diving","desc":"Dive and snorkel spot in Occidental Mindoro.","area":"Occidental Mindoro"}]},
  {"name":"Oriental Mindoro","region":"IV-B","featured":null,"spots":[{"name":"Puerto Galera","type":"Diving","desc":"Dive and snorkel spot in Oriental Mindoro.","area":"Oriental Mindoro"},{"name":"Mount Halcon","type":"Adventure","desc":"Outdoor adventure spot in Oriental Mindoro.","area":"Oriental Mindoro"}]},
  {"name":"Palawan","region":"IV-B","featured":"Palawan","spots":[{"name":"Big Lagoon","type":"Nature","desc":"Paddle between towering limestone walls on Miniloc Island.","area":"El Nido, Palawan"},{"name":"Small Lagoon","type":"Nature","desc":"A narrow entrance opens to calm, shallow turquoise water.","area":"El Nido, Palawan"},{"name":"Secret Lagoon","type":"Nature","desc":"Hidden lagoon reached through a gap in the rock wall.","area":"El Nido, Palawan"},{"name":"Nacpan Beach","type":"Beaches","desc":"Long golden beach with a laid-back surf and sunset scene.","area":"El Nido, Palawan"},{"name":"Kayangan Lake","type":"Nature","desc":"One of the clearest lakes in the country, great for a swim.","area":"Coron, Palawan"},{"name":"Barracuda Lake","type":"Diving","desc":"Dive through warm and cool layers in a volcanic lake.","area":"Coron, Palawan"},{"name":"Puerto Princesa Underground River","type":"Nature","desc":"UNESCO-listed river cave explored by paddle boat.","area":"Puerto Princesa, Palawan"}]},
  {"name":"Romblon","region":"IV-B","featured":null,"spots":[{"name":"Bonbon Beach","type":"Beaches","desc":"Beach destination in Romblon.","area":"Romblon"}]},
  {"name":"Albay","region":"V","featured":null,"spots":[{"name":"Mayon Volcano","type":"Nature","desc":"Natural attraction in Albay.","area":"Albay"},{"name":"Cagsawa Ruins","type":"Culture","desc":"Heritage and cultural site in Albay.","area":"Albay"}]},
  {"name":"Camarines Norte","region":"V","featured":null,"spots":[{"name":"Calaguas Islands","type":"Beaches","desc":"Beach destination in Camarines Norte.","area":"Camarines Norte"}]},
  {"name":"Camarines Sur","region":"V","featured":null,"spots":[{"name":"CWC Camsur Watersports Complex","type":"Adventure","desc":"Outdoor adventure spot in Camarines Sur.","area":"Camarines Sur"},{"name":"Caramoan Islands","type":"Beaches","desc":"Beach destination in Camarines Sur.","area":"Camarines Sur"}]},
  {"name":"Catanduanes","region":"V","featured":null,"spots":[{"name":"Puraran Beach","type":"Adventure","desc":"Outdoor adventure spot in Catanduanes.","area":"Catanduanes"}]},
  {"name":"Masbate","region":"V","featured":null,"spots":[{"name":"Burias Island","type":"Beaches","desc":"Beach destination in Masbate.","area":"Masbate"}]},
  {"name":"Sorsogon","region":"V","featured":null,"spots":[{"name":"Donsol Whale Shark Watching","type":"Nature","desc":"Natural attraction in Sorsogon.","area":"Sorsogon"},{"name":"Bulusan Volcano","type":"Nature","desc":"Natural attraction in Sorsogon.","area":"Sorsogon"}]},
  {"name":"Aklan","region":"VI","featured":"Boracay","spots":[{"name":"White Beach","type":"Beaches","desc":"Four-kilometre white-sand stretch famed for its sunsets.","area":"Boracay"},{"name":"Puka Shell Beach","type":"Beaches","desc":"Quieter beach on the north side with golden sand.","area":"Boracay"},{"name":"Mount Luho View Deck","type":"Nature","desc":"The island's highest viewpoint with a full 360° view.","area":"Boracay"},{"name":"Ariel's Point","type":"Adventure","desc":"Cliff jumping and snorkeling from a boat stop.","area":"Boracay"},{"name":"Bulabog Beach","type":"Adventure","desc":"Kitesurfing and windsurfing on the windy side.","area":"Boracay"},{"name":"Willy's Rock","type":"Culture","desc":"Rock formation topped with a small Virgin Mary shrine.","area":"Boracay"}]},
  {"name":"Antique","region":"VI","featured":null,"spots":[{"name":"Malalison Island","type":"Beaches","desc":"Beach destination in Antique.","area":"Antique"}]},
  {"name":"Capiz","region":"VI","featured":null,"spots":[{"name":"Baybay Beach Roxas","type":"Beaches","desc":"Beach destination in Capiz.","area":"Capiz"}]},
  {"name":"Guimaras","region":"VI","featured":null,"spots":[{"name":"Alubihod Beach","type":"Beaches","desc":"Beach destination in Guimaras.","area":"Guimaras"}]},
  {"name":"Iloilo","region":"VI","featured":null,"spots":[{"name":"Miagao Church","type":"Culture","desc":"Heritage and cultural site in Iloilo.","area":"Iloilo"},{"name":"Gigantes Islands","type":"Beaches","desc":"Beach destination in Iloilo.","area":"Iloilo"}]},
  {"name":"Negros Occidental","region":"VI","featured":null,"spots":[{"name":"The Ruins Talisay","type":"Culture","desc":"Heritage and cultural site in Negros Occidental.","area":"Negros Occidental"},{"name":"Mambukal Resort","type":"Nature","desc":"Natural attraction in Negros Occidental.","area":"Negros Occidental"}]},
  {"name":"Bohol","region":"VII","featured":"Bohol","spots":[{"name":"Chocolate Hills","type":"Nature","desc":"Over 1,200 cone-shaped hills that turn brown in dry season.","area":"Bohol"},{"name":"Philippine Tarsier Sanctuary","type":"Nature","desc":"See one of the world's smallest primates up close.","area":"Bohol"},{"name":"Loboc River Cruise","type":"Culture","desc":"Floating lunch with live music along a green river.","area":"Bohol"},{"name":"Alona Beach","type":"Beaches","desc":"Panglao's lively beach for dining and snorkeling.","area":"Bohol"},{"name":"Baclayon Church","type":"Culture","desc":"One of the oldest stone churches in the country.","area":"Bohol"},{"name":"Balicasag Island","type":"Diving","desc":"Marine sanctuary with turtles and steep coral walls.","area":"Bohol"},{"name":"Hinagdanan Cave","type":"Nature","desc":"Cave with a clear pool you can swim in.","area":"Bohol"}]},
  {"name":"Cebu","region":"VII","featured":"Cebu","spots":[{"name":"Basilica Minore del Santo Niño","type":"Culture","desc":"The country's oldest Roman Catholic church.","area":"Cebu"},{"name":"Magellan's Cross","type":"Culture","desc":"Historic cross marking the arrival of Christianity.","area":"Cebu"},{"name":"Fort San Pedro","type":"Culture","desc":"Spanish-era fort with gardens and old stone walls.","area":"Cebu"},{"name":"Kawasan Falls","type":"Nature","desc":"Tiered turquoise falls popular for canyoneering.","area":"Cebu"},{"name":"Moalboal Sardine Run","type":"Diving","desc":"Swim beside a huge ball of sardines close to shore.","area":"Cebu"},{"name":"Osmeña Peak","type":"Nature","desc":"Highest point in Cebu with sweeping ridge views.","area":"Cebu"},{"name":"Temple of Leah","type":"Culture","desc":"Roman-style mansion built as a tribute to love.","area":"Cebu"}]},
  {"name":"Negros Oriental","region":"VII","featured":null,"spots":[{"name":"Apo Island","type":"Diving","desc":"Dive and snorkel spot in Negros Oriental.","area":"Negros Oriental"},{"name":"Rizal Boulevard Dumaguete","type":"Culture","desc":"Heritage and cultural site in Negros Oriental.","area":"Negros Oriental"}]},
  {"name":"Siquijor","region":"VII","featured":null,"spots":[{"name":"Cambugahay Falls","type":"Nature","desc":"Natural attraction in Siquijor.","area":"Siquijor"},{"name":"Salagdoong Beach","type":"Beaches","desc":"Beach destination in Siquijor.","area":"Siquijor"}]},
  {"name":"Biliran","region":"VIII","featured":null,"spots":[{"name":"Sambawan Island","type":"Beaches","desc":"Beach destination in Biliran.","area":"Biliran"}]},
  {"name":"Eastern Samar","region":"VIII","featured":null,"spots":[{"name":"Calicoan Island","type":"Adventure","desc":"Outdoor adventure spot in Eastern Samar.","area":"Eastern Samar"}]},
  {"name":"Leyte","region":"VIII","featured":null,"spots":[{"name":"San Juanico Bridge","type":"Culture","desc":"Heritage and cultural site in Leyte.","area":"Leyte"},{"name":"Kalanggaman Island","type":"Beaches","desc":"Beach destination in Leyte.","area":"Leyte"}]},
  {"name":"Northern Samar","region":"VIII","featured":null,"spots":[{"name":"Biri Rock Formations","type":"Nature","desc":"Natural attraction in Northern Samar.","area":"Northern Samar"}]},
  {"name":"Samar","region":"VIII","featured":null,"spots":[{"name":"Sohoton Natural Bridge","type":"Nature","desc":"Natural attraction in Samar.","area":"Samar"}]},
  {"name":"Southern Leyte","region":"VIII","featured":null,"spots":[{"name":"Limasawa Island","type":"Culture","desc":"Heritage and cultural site in Southern Leyte.","area":"Southern Leyte"}]},
  {"name":"Zamboanga del Norte","region":"IX","featured":null,"spots":[{"name":"Dakak Beach","type":"Beaches","desc":"Beach destination in Zamboanga del Norte.","area":"Zamboanga del Norte"},{"name":"Rizal Shrine Dapitan","type":"Culture","desc":"Heritage and cultural site in Zamboanga del Norte.","area":"Zamboanga del Norte"}]},
  {"name":"Zamboanga del Sur","region":"IX","featured":null,"spots":[{"name":"Pasonanca Park","type":"Nature","desc":"Natural attraction in Zamboanga del Sur.","area":"Zamboanga del Sur"}]},
  {"name":"Zamboanga Sibugay","region":"IX","featured":null,"spots":[]},
  {"name":"Bukidnon","region":"X","featured":null,"spots":[{"name":"Dahilayan Adventure Park","type":"Adventure","desc":"Outdoor adventure spot in Bukidnon.","area":"Bukidnon"},{"name":"Mount Kitanglad","type":"Adventure","desc":"Outdoor adventure spot in Bukidnon.","area":"Bukidnon"}]},
  {"name":"Camiguin","region":"X","featured":null,"spots":[{"name":"White Island","type":"Beaches","desc":"Beach destination in Camiguin.","area":"Camiguin"},{"name":"Sunken Cemetery","type":"Culture","desc":"Heritage and cultural site in Camiguin.","area":"Camiguin"}]},
  {"name":"Lanao del Norte","region":"X","featured":null,"spots":[{"name":"Maria Cristina Falls","type":"Nature","desc":"Natural attraction in Lanao del Norte.","area":"Lanao del Norte"}]},
  {"name":"Misamis Occidental","region":"X","featured":null,"spots":[{"name":"Hoyohoy Highland Stone Bridge","type":"Nature","desc":"Natural attraction in Misamis Occidental.","area":"Misamis Occidental"}]},
  {"name":"Misamis Oriental","region":"X","featured":null,"spots":[{"name":"Macahambus Gorge","type":"Nature","desc":"Natural attraction in Misamis Oriental.","area":"Misamis Oriental"},{"name":"Cagayan de Oro White Water Rafting","type":"Adventure","desc":"Outdoor adventure spot in Misamis Oriental.","area":"Misamis Oriental"}]},
  {"name":"Davao de Oro","region":"XI","featured":null,"spots":[{"name":"Mount Diwata","type":"Adventure","desc":"Outdoor adventure spot in Davao de Oro.","area":"Davao de Oro"}]},
  {"name":"Davao del Norte","region":"XI","featured":null,"spots":[{"name":"Samal Island","type":"Beaches","desc":"Beach destination in Davao del Norte.","area":"Davao del Norte"}]},
  {"name":"Davao del Sur","region":"XI","featured":"Davao","spots":[{"name":"Philippine Eagle Center","type":"Nature","desc":"Sanctuary for the national bird and other wildlife.","area":"Davao"},{"name":"Samal Island","type":"Beaches","desc":"Island with beaches and resorts a short ferry away.","area":"Davao"},{"name":"Mount Apo","type":"Adventure","desc":"The country's highest peak, for experienced hikers.","area":"Davao"},{"name":"People's Park","type":"Nature","desc":"City park with sculptures and a calm walking path.","area":"Davao"},{"name":"Eden Nature Park","type":"Nature","desc":"Mountain park with gardens, trails and a zip line.","area":"Davao"},{"name":"Davao Crocodile Park","type":"Nature","desc":"Wildlife park with crocodiles, birds and shows.","area":"Davao"}]},
  {"name":"Davao Occidental","region":"XI","featured":null,"spots":[{"name":"Balut Island","type":"Nature","desc":"Natural attraction in Davao Occidental.","area":"Davao Occidental"}]},
  {"name":"Davao Oriental","region":"XI","featured":null,"spots":[{"name":"Dahican Beach","type":"Adventure","desc":"Outdoor adventure spot in Davao Oriental.","area":"Davao Oriental"},{"name":"Pujada Bay","type":"Nature","desc":"Natural attraction in Davao Oriental.","area":"Davao Oriental"}]},
  {"name":"Cotabato","region":"XII","featured":null,"spots":[{"name":"Asik-Asik Falls","type":"Nature","desc":"Natural attraction in Cotabato.","area":"Cotabato"}]},
  {"name":"Sarangani","region":"XII","featured":null,"spots":[{"name":"Gumasa Beach","type":"Beaches","desc":"Beach destination in Sarangani.","area":"Sarangani"}]},
  {"name":"South Cotabato","region":"XII","featured":null,"spots":[{"name":"Lake Sebu","type":"Nature","desc":"Natural attraction in South Cotabato.","area":"South Cotabato"},{"name":"Mount Matutum","type":"Adventure","desc":"Outdoor adventure spot in South Cotabato.","area":"South Cotabato"}]},
  {"name":"Sultan Kudarat","region":"XII","featured":null,"spots":[]},
  {"name":"Agusan del Norte","region":"XIII","featured":null,"spots":[{"name":"Lake Mainit","type":"Nature","desc":"Natural attraction in Agusan del Norte.","area":"Agusan del Norte"}]},
  {"name":"Agusan del Sur","region":"XIII","featured":null,"spots":[{"name":"Agusan Marsh Wildlife Sanctuary","type":"Nature","desc":"Natural attraction in Agusan del Sur.","area":"Agusan del Sur"}]},
  {"name":"Dinagat Islands","region":"XIII","featured":null,"spots":[]},
  {"name":"Surigao del Norte","region":"XIII","featured":"Siargao","spots":[{"name":"Cloud 9","type":"Adventure","desc":"Famous surf break with a boardwalk viewing deck.","area":"Siargao"},{"name":"Sugba Lagoon","type":"Nature","desc":"Turquoise lagoon for paddling, swimming and cliff jumps.","area":"Siargao"},{"name":"Magpupungko Rock Pools","type":"Nature","desc":"Natural tidal pools that fill best at low tide.","area":"Siargao"},{"name":"Naked Island","type":"Beaches","desc":"A bare white sandbar surrounded by clear water.","area":"Siargao"},{"name":"Daku Island","type":"Beaches","desc":"Island stop with a village, a beach and a grilled lunch.","area":"Siargao"},{"name":"Guyam Island","type":"Beaches","desc":"Tiny palm-fringed island you can walk around in minutes.","area":"Siargao"}]},
  {"name":"Surigao del Sur","region":"XIII","featured":null,"spots":[{"name":"Enchanted River","type":"Nature","desc":"Natural attraction in Surigao del Sur.","area":"Surigao del Sur"},{"name":"Tinuy-an Falls","type":"Nature","desc":"Natural attraction in Surigao del Sur.","area":"Surigao del Sur"}]},
  {"name":"Basilan","region":"BARMM","featured":null,"spots":[{"name":"Malamawi Island","type":"Beaches","desc":"Beach destination in Basilan.","area":"Basilan"}]},
  {"name":"Lanao del Sur","region":"BARMM","featured":null,"spots":[{"name":"Lake Lanao","type":"Nature","desc":"Natural attraction in Lanao del Sur.","area":"Lanao del Sur"}]},
  {"name":"Maguindanao del Norte","region":"BARMM","featured":null,"spots":[]},
  {"name":"Maguindanao del Sur","region":"BARMM","featured":null,"spots":[]},
  {"name":"Sulu","region":"BARMM","featured":null,"spots":[]},
  {"name":"Tawi-Tawi","region":"BARMM","featured":null,"spots":[{"name":"Simunul Island Mosque","type":"Culture","desc":"Heritage and cultural site in Tawi-Tawi.","area":"Tawi-Tawi"}]},
];

export const TYPE_STYLE = {
  Beaches: { emoji: '🏝️', bg: 'linear-gradient(180deg,#9fd8ff,#f4e2b8 60%,#2fc4c0)' },
  Nature: { emoji: '🌿', bg: 'linear-gradient(180deg,#d7eec0,#7fbf5a 50%,#3b7d3c)' },
  Diving: { emoji: '🤿', bg: 'linear-gradient(180deg,#4fb3d9,#0e5a8a 60%,#0b2545)' },
  Culture: { emoji: '🏛️', bg: 'linear-gradient(180deg,#f1d6a4,#c96f4a 70%,#8a4a30)' },
  Adventure: { emoji: '🏄', bg: 'linear-gradient(180deg,#ffd9a0,#f59e0b 55%,#b45309)' },
};

// ---- Matching PSGC places to the curated tourist spots above ----------------
const norm = (name) =>
  name.toLowerCase().replace(/^(city|province) of\s+/, '').replace(/\s+city$/, '')
    .replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z0-9 ]/g, '').trim();

// NCR entries are cities, everything else is a province.
const CURATED = new Map(
  PROVINCES.map((p) => [`${p.region === 'NCR' ? 'city' : 'province'}:${norm(p.name)}`, p])
);

// item = a PSGC province / city object ({ name, kind }). Returns the curated entry or null.
export const findCurated = (item) =>
  item ? CURATED.get(`${item.kind || 'province'}:${norm(item.name)}`) || null : null;

// "City of Vigan" / "Laoag City" -> "Vigan" / "Laoag"
export const cleanPlaceName = (name) => name.replace(/^City of\s+/i, '').replace(/\s+City$/i, '').trim();
