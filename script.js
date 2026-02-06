const moneyEl = document.getElementById("money");
const perSecondEl = document.getElementById("perSecond");
const stageNameEl = document.getElementById("stageName");
const printersEl = document.getElementById("printers");
const filamentsEl = document.getElementById("filaments");
const repairsEl = document.getElementById("repairs");
const achievementListEl = document.getElementById("achievementList");
const printButton = document.getElementById("printButton");

let money = 0;
let clickPower = 1;
let bonusMultiplier = 1;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const printers = [
  {
    id: "mini",
    name: "Mini SLA",
    basePrice: 80,
    basePerSecond: 1,
    durabilityMax: 100,
    description: "Rýchla a tichá, ideálna na malé diely.",
  },
  {
    id: "corexy",
    name: "CoreXY Pro",
    basePrice: 240,
    basePerSecond: 4,
    durabilityMax: 120,
    description: "Stabilná a presná pre prototypy.",
  },
  {
    id: "multi",
    name: "Multi-Material",
    basePrice: 520,
    basePerSecond: 10,
    durabilityMax: 140,
    description: "Tlačí z viacerých materiálov naraz.",
  },
  {
    id: "industrial",
    name: "Industrial XL",
    basePrice: 1200,
    basePerSecond: 24,
    durabilityMax: 160,
    description: "Veľkoformátové modely bez stresu.",
  },
  {
    id: "laser",
    name: "Laser Hybrid",
    basePrice: 2400,
    basePerSecond: 52,
    durabilityMax: 180,
    description: "Kombinuje laser a 3D tlač.",
  },
].map((printer) => ({
  ...printer,
  count: 0,
  broken: 0,
  durability: printer.durabilityMax,
}));

const filaments = [
  {
    id: "pla",
    name: "PLA Basic",
    price: 120,
    multiplier: 1.1,
    description: "Klasický materiál s bonusom +10%.",
  },
  {
    id: "petg",
    name: "PETG Shield",
    price: 280,
    multiplier: 1.2,
    description: "Odolný filament s bonusom +20%.",
  },
  {
    id: "abs",
    name: "ABS Turbo",
    price: 520,
    multiplier: 1.35,
    description: "Rýchlejší výtlačok s bonusom +35%.",
  },
  {
    id: "flex",
    name: "Flex Pro",
    price: 900,
    multiplier: 1.5,
    description: "Flexibilné diely, bonus +50%.",
  },
  {
    id: "carbon",
    name: "Carbon Ultimate",
    price: 1600,
    multiplier: 1.75,
    description: "Prémiový filament, bonus +75%.",
  },
].map((filament) => ({
  ...filament,
  purchased: false,
}));

const stages = [
  { name: "Garáž", threshold: 0, className: "stage-garage" },
  { name: "Dielňa", threshold: 500, className: "stage-workshop" },
  { name: "Mini továreň", threshold: 2000, className: "stage-factory" },
  { name: "Výskumné lab", threshold: 7500, className: "stage-lab" },
  { name: "Tlačiarenské impérium", threshold: 20000, className: "stage-empire" },
];

const achievements = [
  {
    id: "first-click",
    title: "Prvá tlač",
    description: "Zarábaj prvých 10 €.",
    condition: () => money >= 10,
  },
  {
    id: "printer-collector",
    title: "Zberateľ strojov",
    description: "Vlastni 5 tlačiarní.",
    condition: () => totalPrinters() >= 5,
  },
  {
    id: "filament-master",
    title: "Filamentový majster",
    description: "Nakúp 3 filamenty.",
    condition: () => filaments.filter((f) => f.purchased).length >= 3,
  },
  {
    id: "repair-crew",
    title: "Servisná čata",
    description: "Oprav 5 tlačiarní.",
    condition: () => totalRepairs >= 5,
  },
  {
    id: "factory-owner",
    title: "Majiteľ fabriky",
    description: "Zarábaj 200 € za sekundu.",
    condition: () => calculatePerSecond() >= 200,
  },
].map((achievement) => ({
  ...achievement,
  unlocked: false,
}));

let totalRepairs = 0;

const formatMoney = (value) => `${value.toFixed(0)} €`;

const playTone = (frequency, duration = 0.12, type = "sine") => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.12;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + duration
  );
  oscillator.stop(audioContext.currentTime + duration);
};

const totalPrinters = () =>
  printers.reduce((sum, printer) => sum + printer.count, 0);

const workingPrinters = (printer) => printer.count - printer.broken;

const priceForPrinter = (printer) =>
  Math.ceil(printer.basePrice * Math.pow(1.18, printer.count));

const repairCost = (printer) =>
  Math.ceil(printer.basePrice * 0.35 * (1 + printer.count * 0.08));

const calculatePerSecond = () => {
  return (
    printers.reduce(
      (sum, printer) =>
        sum + workingPrinters(printer) * printer.basePerSecond,
      0
    ) * bonusMultiplier
  );
};

const applyStage = () => {
  const currentStage = stages
    .slice()
    .reverse()
    .find((stage) => money >= stage.threshold);
  if (currentStage) {
    stageNameEl.textContent = currentStage.name;
    document.body.className = currentStage.className;
  }
};

const updateStats = () => {
  moneyEl.textContent = formatMoney(money);
  perSecondEl.textContent = formatMoney(calculatePerSecond());
  applyStage();
};

const renderPrinters = () => {
  printersEl.innerHTML = "";
  printers.forEach((printer) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("strong");
    title.textContent = printer.name;

    const description = document.createElement("div");
    description.className = "meta";
    description.textContent = printer.description;

    const status = document.createElement("div");
    status.className = "meta";
    status.textContent = `Vlastníš: ${printer.count} | Pokazené: ${printer.broken}`;

    const button = document.createElement("button");
    button.textContent = `Kúpiť (${formatMoney(priceForPrinter(printer))})`;
    button.disabled = money < priceForPrinter(printer);
    button.addEventListener("click", () => {
      const cost = priceForPrinter(printer);
      if (money >= cost) {
        money -= cost;
        printer.count += 1;
        playTone(520, 0.12, "triangle");
        updateAll();
      }
    });

    card.append(title, description, status, button);
    printersEl.appendChild(card);
  });
};

const renderFilaments = () => {
  filamentsEl.innerHTML = "";
  filaments.forEach((filament) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("strong");
    title.textContent = filament.name;

    const description = document.createElement("div");
    description.className = "meta";
    description.textContent = filament.description;

    const button = document.createElement("button");
    button.textContent = filament.purchased
      ? "Aktívny bonus"
      : `Kúpiť (${formatMoney(filament.price)})`;
    button.disabled = filament.purchased || money < filament.price;
    button.addEventListener("click", () => {
      if (!filament.purchased && money >= filament.price) {
        money -= filament.price;
        filament.purchased = true;
        bonusMultiplier = filaments
          .filter((item) => item.purchased)
          .reduce((acc, item) => acc * item.multiplier, 1);
        playTone(720, 0.15, "square");
        updateAll();
      }
    });

    card.append(title, description, button);
    filamentsEl.appendChild(card);
  });
};

const renderRepairs = () => {
  repairsEl.innerHTML = "";
  printers.forEach((printer) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("strong");
    title.textContent = printer.name;

    const status = document.createElement("div");
    status.className = "meta";
    status.textContent = `Pokazené kusy: ${printer.broken}`;

    const button = document.createElement("button");
    button.textContent = `Opraviť (${formatMoney(repairCost(printer))})`;
    button.disabled = printer.broken === 0 || money < repairCost(printer);
    button.addEventListener("click", () => {
      const cost = repairCost(printer);
      if (printer.broken > 0 && money >= cost) {
        money -= cost;
        printer.broken -= 1;
        printer.durability = printer.durabilityMax;
        totalRepairs += 1;
        playTone(330, 0.18, "sawtooth");
        updateAll();
      }
    });

    card.append(title, status, button);
    repairsEl.appendChild(card);
  });
};

const renderAchievements = () => {
  achievementListEl.innerHTML = "";
  achievements.forEach((achievement) => {
    const listItem = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${achievement.title} — ${achievement.description}`;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = achievement.unlocked ? "Splnené" : "Čaká";

    listItem.append(text, badge);
    achievementListEl.appendChild(listItem);
  });
};

const checkAchievements = () => {
  achievements.forEach((achievement) => {
    if (!achievement.unlocked && achievement.condition()) {
      achievement.unlocked = true;
      playTone(880, 0.2, "triangle");
    }
  });
};

const updateAll = () => {
  updateStats();
  renderPrinters();
  renderFilaments();
  renderRepairs();
  checkAchievements();
  renderAchievements();
};

printButton.addEventListener("click", () => {
  money += clickPower * bonusMultiplier;
  playTone(440, 0.08, "sine");
  updateAll();
});

setInterval(() => {
  money += calculatePerSecond() / 1;

  printers.forEach((printer) => {
    if (printer.count === 0) {
      return;
    }
    const working = workingPrinters(printer);
    const breakdownChance = 0.02 + printer.count * 0.001;
    for (let i = 0; i < working; i += 1) {
      if (Math.random() < breakdownChance) {
        printer.broken += 1;
        playTone(220, 0.1, "sawtooth");
      }
    }
  });

  updateAll();
}, 1000);

updateAll();
