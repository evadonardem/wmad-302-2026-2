// Quote data for the app. All quotes live here, so it works with or without internet.
// Each quote: { text, author, tags }. The tags are the topics shown in the "any" menu.
export const fallbackQuotes = [{text:"The only way to do great work is to love what you do.",author:"Steve Jobs",tags:["work", "success"]},
{text:"Whether you think you can or you think you can't, you're right.",author:"Henry Ford",tags:["success", "wisdom", "motivation"]},
{text:"It always seems impossible until it's done.",author:"Nelson Mandela",tags:["success", "life", "motivation"]},
{text:"Well done is better than well said.",author:"Benjamin Franklin",tags:["work", "wisdom"]},
{text:"The unexamined life is not worth living.",author:"Socrates",tags:["wisdom", "life"]},
{text:"Life is what happens while you are busy making other plans.",author:"John Lennon",tags:["life", "wisdom"]},
{text:"Fall seven times, stand up eight.",author:"Japanese Proverb",tags:["life", "courage", "motivation"]},
{text:"Do what you can, with what you have, where you are.",author:"Theodore Roosevelt",tags:["work", "life", "motivation"]},
{text:"Passion is energy. Feel the power that comes from focusing on what excites you.",author:"Oprah Winfrey",tags:["work", "emotions"]},
{text:"Genius is one percent inspiration and ninety-nine percent perspiration.",author:"Thomas Edison",tags:["work", "success", "motivation"]},
{text:"Opportunity is missed by most people because it is dressed in overalls and looks like work.",author:"Thomas Edison",tags:["work", "wisdom"]},
{text:"Love all, trust a few, do wrong to none.",author:"William Shakespeare",tags:["love", "wisdom"]},
{text:"Where there is love there is life.",author:"Mahatma Gandhi",tags:["love", "life", "peace"]},
{text:"To love and be loved is to feel the sun from both sides.",author:"David Viscott",tags:["love", "emotions"]},
{text:"The best thing to hold onto in life is each other.",author:"Audrey Hepburn",tags:["love", "life", "friendship", "family"]},
{text:"Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",author:"Lao Tzu",tags:["love", "emotions", "courage"]},
{text:"You can't stop the waves, but you can learn to surf.",author:"Jon Kabat-Zinn",tags:["emotions", "wisdom", "peace"]},
{text:"The wound is the place where the light enters you.",author:"Rumi",tags:["emotions", "wisdom", "hope"]},
{text:"Nothing can bring you peace but yourself.",author:"Ralph Waldo Emerson",tags:["emotions", "life", "peace"]},
{text:"Tears are words that need to be written.",author:"Paulo Coelho",tags:["emotions", "love"]},
{text:"Friendship is born at that moment when one person says to another: What! You too? I thought I was the only one.",author:"C.S. Lewis",tags:["friendship", "love"]},
{text:"A friend is someone who knows all about you and still loves you.",author:"Elbert Hubbard",tags:["friendship", "love"]},
{text:"Walking with a friend in the dark is better than walking alone in the light.",author:"Helen Keller",tags:["friendship", "hope"]},
{text:"Courage is not the absence of fear, but the triumph over it.",author:"Nelson Mandela",tags:["courage", "wisdom"]},
{text:"You gain strength, courage and confidence by every experience in which you really stop to look fear in the face.",author:"Eleanor Roosevelt",tags:["courage", "life"]},
{text:"Courage is grace under pressure.",author:"Ernest Hemingway",tags:["courage", "emotions"]},
{text:"Happiness is not something ready made. It comes from your own actions.",author:"Dalai Lama",tags:["happiness", "life"]},
{text:"The purpose of our lives is to be happy.",author:"Dalai Lama",tags:["happiness", "life"]},
{text:"Happiness depends upon ourselves.",author:"Aristotle",tags:["happiness", "wisdom"]},
{text:"Happiness is when what you think, what you say, and what you do are in harmony.",author:"Mahatma Gandhi",tags:["happiness", "peace"]},
{text:"Hope is being able to see that there is light despite all of the darkness.",author:"Desmond Tutu",tags:["hope", "emotions"]},
{text:"While there is life, there is hope.",author:"Cicero",tags:["hope", "life"]},
{text:"Once you choose hope, anything's possible.",author:"Christopher Reeve",tags:["hope", "motivation"]},
{text:"All our dreams can come true, if we have the courage to pursue them.",author:"Walt Disney",tags:["dreams", "courage"]},
{text:"The future belongs to those who believe in the beauty of their dreams.",author:"Eleanor Roosevelt",tags:["dreams", "hope"]},
{text:"Dream big and dare to fail.",author:"Norman Vaughan",tags:["dreams", "courage"]},
{text:"Peace begins with a smile.",author:"Mother Teresa",tags:["peace", "kindness"]},
{text:"Peace is not merely a distant goal that we seek, but a means by which we arrive at that goal.",author:"Martin Luther King Jr.",tags:["peace", "wisdom"]},
{text:"Lost time is never found again.",author:"Benjamin Franklin",tags:["time", "wisdom"]},
{text:"The best time to plant a tree was twenty years ago. The second best time is now.",author:"Chinese Proverb",tags:["time", "motivation"]},
{text:"Time is what we want most, but what we use worst.",author:"William Penn",tags:["time", "life"]},
{text:"Family is not an important thing. It's everything.",author:"Michael J. Fox",tags:["family", "love"]},
{text:"In every conceivable manner, the family is link to our past, bridge to our future.",author:"Alex Haley",tags:["family", "life"]},
{text:"Other things may change us, but we start and end with the family.",author:"Anthony Brandt",tags:["family", "life"]},
{text:"No act of kindness, no matter how small, is ever wasted.",author:"Aesop",tags:["kindness", "love"]},
{text:"Be kind, for everyone you meet is fighting a hard battle.",author:"Ian Maclaren",tags:["kindness", "emotions"]},
{text:"Kindness is a language which the deaf can hear and the blind can see.",author:"Mark Twain",tags:["kindness", "wisdom"]},
{text:"The best way to get started is to quit talking and begin doing.",author:"Walt Disney",tags:["motivation", "work"]},
{text:"It does not matter how slowly you go as long as you do not stop.",author:"Confucius",tags:["motivation", "wisdom"]},
{text:"The only impossible journey is the one you never begin.",author:"Tony Robbins",tags:["motivation", "dreams"]},
{text:"In every walk with nature one receives far more than he seeks.",author:"John Muir",tags:["nature", "peace"]},
{text:"Adopt the pace of nature: her secret is patience.",author:"Ralph Waldo Emerson",tags:["nature", "wisdom"]},
{text:"Look deep into nature, and then you will understand everything better.",author:"Albert Einstein",tags:["nature", "learning"]},
{text:"Where words fail, music speaks.",author:"Hans Christian Andersen",tags:["music", "emotions"]},
{text:"Music can change the world because it can change people.",author:"Bono",tags:["music", "hope"]},
{text:"Without music, life would be a mistake.",author:"Friedrich Nietzsche",tags:["music", "life"]},
{text:"An investment in knowledge pays the best interest.",author:"Benjamin Franklin",tags:["learning", "wisdom"]},
{text:"Live as if you were to die tomorrow. Learn as if you were to live forever.",author:"Mahatma Gandhi",tags:["learning", "life"]},
{text:"The more that you read, the more things you will know.",author:"Dr. Seuss",tags:["learning", "wisdom"]}];

// Icon for each topic (shown in the "any" menu)
export const topicIcons = {
  work: '💼',
  love: '❤️',
  emotions: '🌊',
  life: '🌱',
  success: '🏆',
  wisdom: '🧠',
  friendship: '🤝',
  courage: '🦁',
  happiness: '😊',
  hope: '🌈',
  dreams: '⭐',
  peace: '🕊️',
  time: '⏳',
  family: '🏡',
  kindness: '🤍',
  motivation: '🔥',
  nature: '🌿',
  music: '🎵',
  learning: '📚',
};

export const fallbackTags = Object.keys(topicIcons);

let lastText = null;

export const getRandomQuote = async (selectedTag = null) => {
    const matching = selectedTag
        ? fallbackQuotes.filter(({ tags }) => tags.includes(selectedTag))
        : fallbackQuotes;
    const quotes = matching.length ? matching : fallbackQuotes;
    let quote;
    do {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (quote.text === lastText && quotes.length > 1);
    lastText = quote.text;
    return quote;
};

export const getTags = async () => fallbackTags;
