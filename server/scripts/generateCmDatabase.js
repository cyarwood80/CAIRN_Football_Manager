// server/scripts/generateCmDatabase.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data/cm2025/2025 Data Update');

console.log('Loading Championship Manager 2025 binary data files...');
const fnBuf = fs.readFileSync(path.join(dataDir, 'first_names.dat'));
const snBuf = fs.readFileSync(path.join(dataDir, 'second_names.dat'));
const cnBuf = fs.readFileSync(path.join(dataDir, 'common_names.dat'));
const clubBuf = fs.readFileSync(path.join(dataDir, 'club.dat'));
const staffBuf = fs.readFileSync(path.join(dataDir, 'staff.dat'));

function getName(buf, id) {
  if (id < 0 || id * 60 >= buf.length) return '';
  return buf.slice(id * 60, (id + 1) * 60).toString('latin1').split('\0')[0].trim();
}

// Playful, clean homage names for top world stars
const HOMAGE_NAMES = {
  'Erling Haaland': 'Erling AArland',
  'Kylian Mbappé': 'Kylian Mbapay',
  'Jude Bellingham': 'Jude Ballingham',
  'Mohamed Salah': 'Mo Sah-lah',
  'Bukayo Saka': 'Bukayo Star-ka',
  'Vinícius Júnior': 'Vini Magic',
  'Vinicius Junior': 'Vini Magic',
  'Kevin De Bruyne': 'Kev De Brain',
  'Virgil van Dijk': 'Virgil Van Titan',
  'Harry Kane': 'Harry Kanon',
  'Cole Palmer': 'Cole Cold-Palmer',
  'Lamine Yamal': 'Lamine Wonder',
  'David Raya': 'David Rayar',
  'Thibaut Courtois': 'Thibaut Courtwall',
  'Manuel Neuer': 'Manu The Wall',
  'Alisson': 'Alisson Safehands',
  'Ederson': 'Ederson Laser',
  'Gianluigi Donnarumma': 'Gigi Donnarock',
  'Robert Lewandowski': 'Robert Lewan-goal',
  'Phil Foden': 'Phil Fodinho',
  'Martin Ødegaard': 'Martin Maestro',
  'Declan Rice': 'Declan Iron-Rice',
  'Rodri': 'Rodri Engine',
  'William Saliba': 'William Wall-iba',
  'Gabriel Magalhães': 'Gabriel Iron-Mag',
  'Pedri': 'Pedri Golden-Boy',
  'Gavi': 'Gavi Pitbull',
  'Alexander Isak': 'Alex Iso-Striker',
  'Son Heung-min': 'Sonny Flash',
  'Bruno Fernandes': 'Bruno Architect',
};

const MANAGERS = [
  'Pep Guardiola', 'Mikel Arteta', 'Arne Slot', 'Carlo Ancelotti', 'Hansi Flick',
  'Vincent Kompany', 'Enzo Maresca', 'Luis Enrique', 'Erik ten Hag', 'Rúben Amorim',
  'Ange Postecoglou', 'Thomas Frank', 'Unai Emery', 'Eddie Howe', 'Stan Kroenke',
  'Tom Werner', 'Khaldoon Al Mubarak', 'Todd Boehly', 'Daniel Levy'
];

// Expanded selection of 20 top clubs from the CM 2025 database
const TARGET_CLUBS = [
  // Premier League
  { name: 'Arsenal', id: 867, shortName: 'ARS', color: '#EF0107', secondary: '#063672', primaryGK: 'David Rayar' },
  { name: 'Manchester City', id: 7022, shortName: 'MCI', color: '#6CABDD', secondary: '#1C2C5B', primaryGK: 'Ederson Laser' },
  { name: 'Liverpool', id: 6635, shortName: 'LIV', color: '#C8102E', secondary: '#00B2A9', primaryGK: 'Alisson Safehands' },
  { name: 'Chelsea', id: 2444, shortName: 'CHE', color: '#034694', secondary: '#EE242C', primaryGK: 'Robert Sánchez' },
  { name: 'Manchester United', id: 7023, shortName: 'MUN', color: '#DA291C', secondary: '#FBE122', primaryGK: 'André Onana' },
  { name: 'Tottenham Hotspur', id: 1657, shortName: 'TOT', color: '#132257', secondary: '#FFFFFF', primaryGK: 'Guglielmo Vicario' },
  { name: 'Aston Villa', id: 933, shortName: 'AVL', color: '#95BFE5', secondary: '#670E36', primaryGK: 'Emiliano Martínez' },
  { name: 'Newcastle United', id: 7468, shortName: 'NEW', color: '#241F20', secondary: '#41B6E6', primaryGK: 'Nick Pope' },
  { name: 'Brighton and Hove Albion', id: 1887, shortName: 'BHA', color: '#0057B8', secondary: '#FFCD00', primaryGK: 'Bart Verbruggen' },
  { name: 'West Ham United', id: 2356, shortName: 'WHU', color: '#7A263A', secondary: '#1BB1E7', primaryGK: 'Alphonse Areola' },

  // La Liga
  { name: 'Real Madrid C.F.', cleanName: 'Real Madrid', id: 9413, shortName: 'RMA', color: '#FFFFFF', secondary: '#FEBE10', primaryGK: 'Thibaut Courtwall' },
  { name: 'F.C. Barcelona', cleanName: 'Barcelona', id: 1340, shortName: 'BAR', color: '#004D98', secondary: '#A50044', primaryGK: 'Marc-André ter Stegen' },
  { name: 'Atlético de Madrid', id: 1014, shortName: 'ATM', color: '#CB3524', secondary: '#272E61', primaryGK: 'Jan Oblak' },
  { name: 'Athletic Club de Bilbao', cleanName: 'Athletic Bilbao', id: 970, shortName: 'ATH', color: '#EE2524', secondary: '#FFFFFF', primaryGK: 'Unai Simón' },

  // Bundesliga
  { name: 'FC Bayern München', cleanName: 'Bayern Munich', id: 3766, shortName: 'BAY', color: '#DC052D', secondary: '#0066B2', primaryGK: 'Manu The Wall' },
  { name: 'Borussia Dortmund', id: 3234, shortName: 'BVB', color: '#FDE100', secondary: '#000000', primaryGK: 'Gregor Kobel' },
  { name: 'Bayer 04 Leverkusen', id: 1417, shortName: 'B04', color: '#E32221', secondary: '#000000', primaryGK: 'Lukás Hrádecky' },

  // Serie A & Ligue 1
  { name: 'Internazionale', cleanName: 'Inter Milan', id: 5377, shortName: 'INT', color: '#010E80', secondary: '#000000', primaryGK: 'Yann Sommer' },
  { name: 'Juventus FC', id: 5691, shortName: 'JUV', color: '#FFFFFF', secondary: '#000000', primaryGK: 'Michele Di Gregorio' },
  { name: 'Paris Saint-Germain', id: 8645, shortName: 'PSG', color: '#004170', secondary: '#DA291C', primaryGK: 'Gigi Donnarock' },
];

const KNOWN_ROLES = {
  // Goalkeepers
  'David Rayar': 'GK', 'David Raya': 'GK', 'Kepa Arrizabalaga': 'GK', 'Tommy Setford': 'GK',
  'Ederson Laser': 'GK', 'Ederson': 'GK', 'Stefan Ortega': 'GK', 'Alisson Safehands': 'GK', 'Alisson': 'GK',
  'Giorgi Mamardashvili': 'GK', 'Thibaut Courtwall': 'GK', 'Thibaut Courtois': 'GK', 'Andriy Lunin': 'GK',
  'Marc-André ter Stegen': 'GK', 'Iñaki Peña': 'GK', 'Manu The Wall': 'GK', 'Manuel Neuer': 'GK',
  'Gigi Donnarock': 'GK', 'Gianluigi Donnarumma': 'GK', 'Robert Sánchez': 'GK', 'André Onana': 'GK',
  'Guglielmo Vicario': 'GK', 'Emiliano Martínez': 'GK', 'Nick Pope': 'GK', 'Bart Verbruggen': 'GK',
  'Jan Oblak': 'GK', 'Gregor Kobel': 'GK', 'Yann Sommer': 'GK', 'Lukás Hrádecky': 'GK', 'Unai Simón': 'GK',
  'Alphonse Areola': 'GK', 'Michele Di Gregorio': 'GK',

  // Center Backs & Full Backs
  'William Wall-iba': 'CB', 'William Saliba': 'CB', 'Gabriel Iron-Mag': 'CB', 'Gabriel Magalhães': 'CB',
  'Jurriën Timber': 'RB', 'Riccardo Calafiori': 'LB', 'Ben White': 'RB', 'Oleksandr Zinchenko': 'LB',
  'Rúben Dias': 'CB', 'Nathan Aké': 'CB', 'Josko Gvardiol': 'LB', 'Manuel Akanji': 'CB', 'John Stones': 'CB',
  'Rico Lewis': 'RB', 'Kyle Walker': 'RB',
  'Virgil Van Titan': 'CB', 'Virgil van Dijk': 'CB', 'Ibrahima Konaté': 'CB', 'Trent Alexander-Arnold': 'RB',
  'Andrew Robertson': 'LB', 'Jeremie Frimpong': 'RB', 'Milos Kerkez': 'LB', 'Joe Gomez': 'CB',
  'Antonio Rüdiger': 'CB', 'Éder Militão': 'CB', 'David Alaba': 'CB', 'Dani Carvajal': 'RB', 'Ferland Mendy': 'LB',
  'Ronald Araújo': 'CB', 'Pau Cubarsí': 'CB', 'Andreas Christensen': 'CB', 'Jules Koundé': 'RB', 'Alejandro Balde': 'LB',
  'Dayot Upamecano': 'CB', 'Min-jae Kim': 'CB', 'Jonathan Tah': 'CB', 'Alphonso Davies': 'LB', 'Sacha Boey': 'RB',
  'Levi Colwill': 'CB', 'Wesley Fofana': 'CB', 'Malo Gusto': 'RB', 'Marc Cucurella': 'LB', 'Reece James': 'RB',
  'Marquinhos': 'CB', 'Willian Pacho': 'CB', 'Achraf Hakimi': 'RB', 'Nuno Mendes': 'LB',
  'Lisandro Martínez': 'CB', 'Matthijs de Ligt': 'CB', 'Leny Yoro': 'CB', 'Diogo Dalot': 'RB', 'Noussair Mazraoui': 'LB',
  'Cristian Romero': 'CB', 'Micky van de Ven': 'CB', 'Pedro Porro': 'RB', 'Destiny Udogie': 'LB',
  'Nico Schlotterbeck': 'CB', 'Niklas Süle': 'CB', 'Alessandro Bastoni': 'CB', 'Benjamin Pavard': 'CB',
  'Federico Dimarco': 'LB', 'Gleison Bremer': 'CB', 'Pau Torres': 'CB', 'Ezri Konsa': 'CB', 'Sven Botman': 'CB',

  // Midfielders
  'Declan Iron-Rice': 'CDM', 'Declan Rice': 'CDM', 'Martin Maestro': 'CAM', 'Martin Ødegaard': 'CAM',
  'Mikel Merino': 'CM', 'Martín Zubimendi': 'CDM', 'Ethan Nwaneri': 'CAM',
  'Rodri Engine': 'CDM', 'Rodri': 'CDM', 'Kev De Brain': 'CAM', 'Kevin De Bruyne': 'CAM',
  'Bernardo Silva': 'CAM', 'Mateo Kovacic': 'CM', 'Ilkay Gündogan': 'CM', 'Tijjani Reijnders': 'CM',
  'Alexis Mac Allister': 'CM', 'Dominik Szoboszlai': 'CAM', 'Ryan Gravenberch': 'CDM', 'Florian Wirtz': 'CAM',
  'Jude Ballingham': 'CAM', 'Jude Bellingham': 'CAM', 'Federico Valverde': 'CM', 'Aurélien Tchouaméni': 'CDM', 'Eduardo Camavinga': 'CM',
  'Pedri Golden-Boy': 'CM', 'Pedri': 'CM', 'Gavi Pitbull': 'CM', 'Gavi': 'CM', 'Frenkie de Jong': 'CDM', 'Dani Olmo': 'CAM',
  'Joshua Kimmich': 'CDM', 'Jamal Musiala': 'CAM', 'Aleksandar Pavlovic': 'CM', 'Leon Goretzka': 'CM',
  'Moisés Caicedo': 'CDM', 'Enzo Fernández': 'CM', 'Cole Cold-Palmer': 'CAM', 'Cole Palmer': 'CAM', 'Roméo Lavia': 'CDM',
  'Warren Zaïre-Emery': 'CM', 'Vitinha': 'CM', 'Joao Neves': 'CDM', 'Fabián Ruiz': 'CM',
  'Bruno Architect': 'CAM', 'Bruno Fernandes': 'CAM', 'Kobbie Mainoo': 'CM', 'Manuel Ugarte': 'CDM',
  'James Maddison': 'CAM', 'Rodrigo Bentancur': 'CM', 'Dejan Kulusevski': 'CAM', 'Nicolò Barella': 'CM',
  'Hakan Çalhanoglu': 'CDM', 'Teun Koopmeiners': 'CAM', 'Douglas Luiz': 'CM', 'Bruno Guimarães': 'CDM',

  // Wingers & Strikers
  'Bukayo Star-ka': 'RW', 'Bukayo Saka': 'RW', 'Erling AArland': 'ST', 'Erling Haaland': 'ST',
  'Kylian Mbapay': 'ST', 'Kylian Mbappé': 'ST', 'Mo Sah-lah': 'RW', 'Mohamed Salah': 'RW',
  'Vini Magic': 'LW', 'Vinícius Júnior': 'LW', 'Vinicius Junior': 'LW',
  'Harry Kanon': 'ST', 'Harry Kane': 'ST', 'Robert Lewan-goal': 'ST', 'Robert Lewandowski': 'ST',
  'Lamine Wonder': 'RW', 'Lamine Yamal': 'RW', 'Phil Fodinho': 'LW', 'Phil Foden': 'LW',
  'Alex Iso-Striker': 'ST', 'Alexander Isak': 'ST', 'Sonny Flash': 'LW', 'Son Heung-min': 'LW',
  'Kai Havertz': 'ST', 'Viktor Gyökeres': 'ST', 'Gabriel Martinelli': 'LW', 'Gabriel Jesus': 'ST',
  'Jérémy Doku': 'RW', 'Savinho': 'RW', 'Omar Marmoush': 'ST', 'Rayan Cherki': 'CAM',
  'Luis Díaz': 'LW', 'Cody Gakpo': 'LW', 'Darwin Núñez': 'ST', 'Diogo Jota': 'ST', 'Federico Chiesa': 'RW',
  'Rodrygo': 'RW', 'Endrick': 'ST', 'Brahim Díaz': 'RW', 'Arda Güler': 'CAM',
  'Raphinha': 'LW', 'Ferran Torres': 'ST', 'Ansu Fati': 'LW',
  'Michael Olise': 'RW', 'Leroy Sané': 'RW', 'Serge Gnabry': 'LW', 'Kingsley Coman': 'LW',
  'Nicolas Jackson': 'ST', 'Christopher Nkunku': 'ST', 'Pedro Neto': 'RW', 'Estêvão': 'RW',
  'Bradley Barcola': 'LW', 'Ousmane Dembélé': 'RW', 'Khvicha Kvaratskhelia': 'LW', 'Gonçalo Ramos': 'ST',
  'Rasmus Højlund': 'ST', 'Marcus Rashford': 'LW', 'Alejandro Garnacho': 'RW', 'Joshua Zirkzee': 'ST',
  'Dominic Solanke': 'ST', 'Ollie Watkins': 'ST', 'Lautaro Martínez': 'ST', 'Marcus Thuram': 'ST',
  'Dušan Vlahovic': 'ST', 'Serhou Guirassy': 'ST', 'Victor Boniface': 'ST',
};

// Calculate realistic transfer value (£M) & prompt capability tier (1 - 5)
function calculateBaseTransferAttributes(name, role, rawWage = 10000) {
  let tier = 3;
  let baseValue = 12.0;

  // Elite Superstars
  if (['Erling AArland', 'Kylian Mbapay', 'Jude Ballingham', 'Vini Magic', 'Mo Sah-lah', 'Bukayo Star-ka', 'Lamine Wonder', 'Harry Kanon', 'Cole Cold-Palmer', 'Phil Fodinho'].includes(name)) {
    tier = 5;
    baseValue = 32.5;
  }
  // World Class Specialists
  else if (['Declan Iron-Rice', 'Rodri Engine', 'Martin Maestro', 'Virgil Van Titan', 'William Wall-iba', 'Kev De Brain', 'Robert Lewan-goal', 'Thibaut Courtwall', 'Manu The Wall', 'David Rayar', 'Alisson Safehands', 'Pedri Golden-Boy', 'Florian Wirtz', 'Alex Iso-Striker', 'Jamal Musiala'].includes(name)) {
    tier = 4;
    baseValue = 24.0;
  }
  // Established First Team Pros
  else if (rawWage > 35000) {
    tier = 3;
    baseValue = 14.5 + Math.min(6.0, (rawWage / 20000));
  }
  // Solid Squad Players
  else if (rawWage > 10000) {
    tier = 2;
    baseValue = 7.5 + (rawWage / 15000);
  }
  // Raw / Youth Prospects
  else {
    tier = 1;
    baseValue = 2.5 + (rawWage / 8000);
  }

  return {
    tier,
    transferValue: +baseValue.toFixed(1),
    promptCapability: tier === 5 ? "Elite (Autonomous Vision & Precision)" : tier === 4 ? "Advanced (High Discipline & Flow)" : tier === 3 ? "Standard (Tactical Compliance)" : tier === 2 ? "Developing (Needs Clear Instructions)" : "Raw Youth (Basic Prompts)",
  };
}

const clubDataList = [];
const allPlayersPool = [];

TARGET_CLUBS.forEach((target) => {
  const clubName = target.cleanName || target.name;
  const clubObj = {
    id: target.id,
    name: clubName,
    shortName: target.shortName,
    color: target.color,
    secondaryColor: target.secondary,
    primaryGK: target.primaryGK,
    players: [],
  };

  for (let i = 0; i < staffBuf.length / 110; i++) {
    const off = i * 110;
    const staffClubId = staffBuf.readInt32LE(off + 57);
    if (staffClubId === target.id) {
      const wage = staffBuf.readInt32LE(off + 78);
      if (wage > 2000) {
        const fn = getName(fnBuf, staffBuf.readInt32LE(off + 4));
        const sn = getName(snBuf, staffBuf.readInt32LE(off + 8));
        const cn = getName(cnBuf, staffBuf.readInt32LE(off + 12));
        const rawName = cn || `${fn} ${sn}`.trim();

        if (MANAGERS.includes(rawName)) continue;
        const lower = rawName.toLowerCase();
        if (lower.includes('coach') || lower.includes('scout') || lower.includes('physio') || lower.includes('director') || lower.includes('chairman') || lower.includes('doctor')) {
          continue;
        }

        // Apply playful clean homage name if superstar
        const displayName = HOMAGE_NAMES[rawName] || rawName;
        let assignedRole = KNOWN_ROLES[displayName] || KNOWN_ROLES[rawName];
        if (!assignedRole) {
          if (displayName === target.primaryGK || rawName === target.primaryGK) assignedRole = 'GK';
          else assignedRole = staffBuf.readUInt8(off + 80) === 0 ? 'GK' : 'CM';
        }

        const attr = calculateBaseTransferAttributes(displayName, assignedRole, wage);

        const playerItem = {
          id: i,
          name: displayName,
          originalName: rawName,
          role: assignedRole,
          wage,
          club: clubName,
          tier: attr.tier,
          transferValue: attr.transferValue,
          promptCapability: attr.promptCapability,
        };
        clubObj.players.push(playerItem);
        allPlayersPool.push(playerItem);
      }
    }
  }

  clubObj.players.sort((a, b) => b.transferValue - a.transferValue || b.wage - a.wage);
  clubDataList.push(clubObj);
});

// Compile 14-man squads (11 starters + 3 bench subs)
const compiledClubs = clubDataList.map((c) => {
  let gk = c.players.find((p) => p.name === c.primaryGK || p.originalName === c.primaryGK) ||
           c.players.find((p) => p.role === 'GK') ||
           { name: `${c.shortName} Keeper`, role: 'GK', transferValue: 12.0, tier: 3 };

  const available = c.players.filter((p) => p.name !== gk.name);
  const defs = available.filter((p) => ['CB', 'LB', 'RB', 'DEF', 'LWB', 'RWB'].includes(p.role));
  const mids = available.filter((p) => ['CDM', 'CM', 'CAM', 'MID'].includes(p.role));
  const fwds = available.filter((p) => ['ST', 'LW', 'RW', 'FWD'].includes(p.role));
  const other = available.filter((p) => !defs.includes(p) && !mids.includes(p) && !fwds.includes(p));

  const fallback = (name, role, val = 4.0, t = 2) => ({ name: `${c.shortName} ${name}`, role, transferValue: val, tier: t });

  // Exactly 11 starters:
  // 1: GK, 2: RB, 3: CB, 4: CB, 5: LB, 6: CDM, 7: RW, 8: CAM, 9: ST, 10: CM, 11: LW
  const starting11 = [
    { number: 1, name: gk.name, role: 'GK', transferValue: gk.transferValue || 12.0, tier: gk.tier || 3 },
    { number: 2, name: (defs[0] || other[0] || fallback('Right Back', 'RB')).name, role: 'RB', transferValue: (defs[0] || other[0])?.transferValue || 8.0, tier: (defs[0] || other[0])?.tier || 2 },
    { number: 3, name: (defs[1] || other[1] || fallback('Center Back L', 'CB')).name, role: 'CB', transferValue: (defs[1] || other[1])?.transferValue || 10.0, tier: (defs[1] || other[1])?.tier || 3 },
    { number: 4, name: (defs[2] || other[2] || fallback('Center Back R', 'CB')).name, role: 'CB', transferValue: (defs[2] || other[2])?.transferValue || 9.5, tier: (defs[2] || other[2])?.tier || 3 },
    { number: 5, name: (defs[3] || other[3] || fallback('Left Back', 'LB')).name, role: 'LB', transferValue: (defs[3] || other[3])?.transferValue || 8.0, tier: (defs[3] || other[3])?.tier || 2 },
    { number: 6, name: (mids[0] || other[4] || fallback('Anchor CDM', 'CDM')).name, role: 'CDM', transferValue: (mids[0] || other[4])?.transferValue || 11.0, tier: (mids[0] || other[4])?.tier || 3 },
    { number: 7, name: (fwds[0] || other[5] || fallback('Right Winger', 'RW')).name, role: 'RW', transferValue: (fwds[0] || other[5])?.transferValue || 15.0, tier: (fwds[0] || other[5])?.tier || 3 },
    { number: 8, name: (mids[1] || other[6] || fallback('Playmaker CAM', 'CAM')).name, role: 'CAM', transferValue: (mids[1] || other[6])?.transferValue || 14.0, tier: (mids[1] || other[6])?.tier || 3 },
    { number: 9, name: (fwds[1] || other[7] || fallback('Center Forward', 'ST')).name, role: 'ST', transferValue: (fwds[1] || other[7])?.transferValue || 18.0, tier: (fwds[1] || other[7])?.tier || 4 },
    { number: 10, name: (mids[2] || other[8] || fallback('Box-to-Box CM', 'CM')).name, role: 'CM', transferValue: (mids[2] || other[8])?.transferValue || 10.5, tier: (mids[2] || other[8])?.tier || 3 },
    { number: 11, name: (fwds[2] || other[9] || fallback('Left Winger', 'LW')).name, role: 'LW', transferValue: (fwds[2] || other[9])?.transferValue || 14.0, tier: (fwds[2] || other[9])?.tier || 3 },
  ];

  // Exactly 4 bench substitutes: GK, DEF, MID, ST (Total 15 players)
  const benchSubs = [
    { number: 12, name: (gks[1] || other[10] || fallback('Backup Goalkeeper', 'GK')).name, role: 'GK', transferValue: (gks[1] || other[10])?.transferValue || 5.0, tier: 2 },
    { number: 13, name: (defs[4] || other[11] || fallback('Backup Center Back', 'CB')).name, role: 'CB', transferValue: (defs[4] || other[11])?.transferValue || 5.5, tier: 2 },
    { number: 14, name: (mids[3] || other[12] || fallback('Midfield Engine', 'CM')).name, role: 'CM', transferValue: (mids[3] || other[12])?.transferValue || 6.0, tier: 2 },
    { number: 15, name: (fwds[3] || other[13] || fallback('Impact Striker', 'ST')).name, role: 'ST', transferValue: (fwds[3] || other[13])?.transferValue || 6.5, tier: 2 },
  ];

  const totalValue = +(starting11.reduce((sum, p) => sum + p.transferValue, 0) + benchSubs.reduce((sum, p) => sum + p.transferValue, 0)).toFixed(1);

  return {
    id: c.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: c.name,
    shortName: c.shortName,
    color: c.color,
    secondaryColor: c.secondaryColor,
    totalSquadValue: totalValue,
    squadHarmony: 88, // Starting default harmony (88%)
    starting11,
    benchSubs,
  };
});

// Prepare transfer market listings (50+ available players for purchase)
const marketListings = allPlayersPool
  .filter((p, idx, arr) => arr.findIndex((x) => x.name === p.name) === idx)
  .slice(0, 80)
  .map((p) => ({
    id: `market_${p.id}`,
    name: p.name,
    role: p.role,
    club: p.club,
    tier: p.tier,
    transferValue: p.transferValue,
    promptCapability: p.promptCapability,
    status: 'available',
  }));

const outputPath = path.join(__dirname, '../data/cm2025Database.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      clubs: compiledClubs,
      marketListings,
      totalPlayersInPool: allPlayersPool.length,
    },
    null,
    2
  )
);

console.log(`✅ Successfully compiled expanded CM 2025 Database to: ${outputPath}`);
console.log(`Extracted ${compiledClubs.length} clubs and ${marketListings.length} market transfer listings!`);
