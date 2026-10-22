import { SoftwareProduct, SoftwareModule, CloudConfig, User, Order } from '../types';

export const PRODUCTS: SoftwareProduct[] = [
  {
    id: 'dexum-lifetime',
    name: 'Dexum Client Lifetime',
    tagline: 'Полный доступ ко всем функциям клиента навсегда',
    category: 'client',
    price: 1990,
    originalPrice: 2990,
    durationLabel: 'Навсегда (Lifetime)',
    popular: true,
    featured: true,
    supportedVersions: ['26.2'],
    supportedServers: ['Fabric 26.2'],
    features: [
      'Все 28 модулей: Combat, Movement, Render, Player, World',
      'Бессрочный доступ и все будущие обновления',
      'ClickGui с drag & drop панелями и поиском',
      'Система конфигов с автосохранением',
      'Команды: .help, .bind, .toggle, .friend, .config',
      'Friend-система с ESP, HUD и стрелками',
      'Custom HUD: Watermark, FriendHUD, Nametags',
      'Приоритетная поддержка в Discord'
    ],
    badge: 'ХИТ',
    downloadSize: '—',
    version: 'Fabric 26.2'
  },
  {
    id: 'dexum-90-days',
    name: 'Dexum Client 90 Дней',
    tagline: 'Полный функционал клиента на 3 месяца',
    category: 'client',
    price: 990,
    originalPrice: 1390,
    durationLabel: '3 Месяца (90 дней)',
    popular: false,
    featured: false,
    supportedVersions: ['26.2
    supportedServers: ['Fabric 26.2'],
    features: [
      'Все 28 модулей клиента',
      'ClickGui и все HUD-элементы',
      'Система конфигов и команд',
      'Friend-система с ESP и HUD',
      'Обновления в течение срока'
    ],
    badge: 'ВЫГОДНО',
    downloadSize: '—',
    version: 'Fabric 26.2'
  },
  {
    id: 'dexum-30-days',
    name: 'Dexum Client 30 Дней',
    tagline: 'Попробовать полный функционал на месяц',
    category: 'client',
    price: 490,
    durationLabel: '1 Месяц (30 дней)',
    popular: false,
    featured: false,
    supportedVersions: ['26.2
    supportedServers: ['Fabric 26.2'],
    features: [
      'Все 28 модулей клиента',
      'ClickGui и базовые HUD-элементы',
      'Система конфигов и команд',
      'Обновления в течение срока'
    ],
    downloadSize: '—',
    version: 'Fabric 26.2'
  }
];

export const MODULES: SoftwareModule[] = [
  {
    id: 'aura',
    name: 'Aura',
    category: 'Combat',
    description: 'Автоматическая атака цели с silent-ротацией, приоритетом выбора цели (прицел/дистанция/HP) и дистанцией до 6 блоков.',
    bypasses: ['Client-side'],
    hotkey: 'R',
    iconName: 'Swords',
    isPopular: true
  },
  {
    id: 'triggerbot',
    name: 'TriggerBot',
    category: 'Combat',
    description: 'Автоматический удар, когда прицел наведён на цель. Крит-режим и рандомизация задержки.',
    bypasses: ['Client-side'],
    hotkey: 'X',
    iconName: 'Crosshair'
  },
  {
    id: 'aimassist',
    name: 'AimAssist',
    category: 'Combat',
    description: 'Плавное притяжение прицела к цели при движении мыши. FOV и настраиваемая сила.',
    bypasses: ['Client-side'],
    iconName: 'Compass'
  },
  {
    id: 'nofrienddamage',
    name: 'NoFriendDamage',
    category: 'Combat',
    description: 'Блокирует удары по игрокам из списка друзей.',
    bypasses: ['Client-side'],
    iconName: 'Shield'
  },
  {
    id: 'sprint',
    name: 'Sprint',
    category: 'Movement',
    description: 'Автоматическое удержание спринта при движении с проверкой голода и эффектов.',
    bypasses: ['Client-side'],
    iconName: 'FastForward'
  },
  {
    id: 'noslow',
    name: 'NoSlow',
    category: 'Movement',
    description: 'Убирает замедление при использовании предметов (еда, щит, лук).',
    bypasses: ['Client-side'],
    iconName: 'Footprints'
  },
  {
    id: 'nopush',
    name: 'NoPush',
    category: 'Movement',
    description: 'Отключает отталкивание от сущностей и водных потоков.',
    bypasses: ['Client-side'],
    iconName: 'ArrowUpRight'
  },
  {
    id: 'autosneak',
    name: 'AutoSneak',
    category: 'Movement',
    description: 'Приседание у края блоков при движении — защита от случайного падения.',
    bypasses: ['Client-side'],
    iconName: 'Footprints'
  },
  {
    id: 'nofall',
    name: 'NoFall',
    category: 'Movement',
    description: 'Отмена урона от падения. Режимы Vanilla и Packet.',
    bypasses: ['Client-side'],
    iconName: 'Shield'
  },
  {
    id: 'clickgui',
    name: 'ClickGui',
    category: 'Render',
    description: 'Графический интерфейс на Right Shift. Панели по категориям, поиск модулей, drag & drop.',
    bypasses: ['UI'],
    hotkey: 'RShift',
    iconName: 'Layout'
  },
  {
    id: 'watermark',
    name: 'Watermark',
    category: 'Render',
    description: 'HUD с ником, FPS и временем. Перетаскивается мышью, сохраняет позицию.',
    bypasses: ['HUD'],
    iconName: 'Eye'
  },
  {
    id: 'nametags',
    name: 'Nametags',
    category: 'Render',
    description: 'Имена игроков над головой с HP, пингом и меткой друга.',
    bypasses: ['HUD'],
    iconName: 'Eye',
    isPopular: true
  },
  {
    id: 'friendesp',
    name: 'FriendESP',
    category: 'Render',
    description: 'Подсветка друзей рамкой и линией через стены.',
    bypasses: ['Client-side'],
    iconName: 'Eye'
  },
  {
    id: 'friendhud',
    name: 'FriendHUD',
    category: 'Render',
    description: 'Панель с HP и пингом онлайн-друзей. Перетаскивается мышью.',
    bypasses: ['HUD'],
    iconName: 'Layout'
  },
  {
    id: 'friendarrow',
    name: 'FriendArrow',
    category: 'Render',
    description: 'Стрелки вокруг центра экрана в сторону друзей.',
    bypasses: ['HUD'],
    iconName: 'Compass'
  },
  {
    id: 'freecam',
    name: 'FreeCam',
    category: 'Render',
    description: 'Свободная камера без движения тела. Спуф позиции, выход при уроне.',
    bypasses: ['Client-side'],
    iconName: 'Eye'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Render',
    description: 'Приближение камеры на биндклавишу с плавной интерполяцией FOV.',
    bypasses: ['Client-side'],
    hotkey: 'C',
    iconName: 'Eye'
  },
  {
    id: 'nobob',
    name: 'NoBob',
    category: 'Render',
    description: 'Убирает покачивание камеры при ходьбе.',
    bypasses: ['Client-side'],
    iconName: 'Layout'
  },
  {
    id: 'nofov',
    name: 'NoFov',
    category: 'Render',
    description: 'Отключает FOV-эффекты (спринт, зелья, лук).',
    bypasses: ['Client-side'],
    iconName: 'Layout'
  },
  {
    id: 'antiblind',
    name: 'AntiBlind',
    category: 'Render',
    description: 'Убирает эффекты темноты и слепоты.',
    bypasses: ['Client-side'],
    iconName: 'Eye'
  },
  {
    id: 'nohurtcam',
    name: 'NoHurtCam',
    category: 'Render',
    description: 'Убирает тряску камеры при получении урона.',
    bypasses: ['Client-side'],
    iconName: 'Shield'
  },
  {
    id: 'fullbright',
    name: 'FullBright',
    category: 'Render',
    description: 'Убирает темноту — гамма на максимум.',
    bypasses: ['Client-side'],
    iconName: 'Eye'
  },
  {
    id: 'nodelay',
    name: 'NoDelay',
    category: 'Player',
    description: 'Убирает задержку прыжка, ломания блоков и правого клика.',
    bypasses: ['Client-side'],
    iconName: 'Zap'
  },
  {
    id: 'nointeract',
    name: 'NoInteract',
    category: 'Player',
    description: 'Блокирует случайное взаимодействие с блоками/сущностями (сундуки, двери, лодки).',
    bypasses: ['Client-side'],
    iconName: 'Shield'
  },
  {
    id: 'cheststealer',
    name: 'ChestStealer',
    category: 'Player',
    description: 'Автоматическое обчищение сундуков с рандомизированной задержкой.',
    bypasses: ['Client-side'],
    iconName: 'Package',
    isPopular: true
  },
  {
    id: 'autorespawn',
    name: 'AutoRespawn',
    category: 'Player',
    description: 'Автоматическое возрождение после смерти с настраиваемой задержкой.',
    bypasses: ['Client-side'],
    iconName: 'HeartHandshake'
  },
  {
    id: 'streamermode',
    name: 'StreamerMode',
    category: 'Player',
    description: 'Скрывает ник и название клиента в HUD (для стримов и скриншотов).',
    bypasses: ['HUD'],
    iconName: 'Eye'
  },
  {
    id: 'timechanger',
    name: 'TimeChanger',
    category: 'World',
    description: 'Клиентское изменение времени суток (день/ночь/закат и т.д.).',
    bypasses: ['Client-side'],
    iconName: 'Compass'
  }
];

export const CLOUD_CONFIGS: CloudConfig[] = [
  {
    id: 'cfg-default-hvh',
    name: 'default_hvh.cfg',
    server: 'HvH',
    playstyle: 'Rage / HvH',
    author: 'Dexum',
    downloads: 0,
    rating: 5,
    lastUpdated: 'Стартовый',
    modulesCount: 8,
    description: 'Базовый HvH-пресет: Aura, TriggerBot, NoSlow, Sprint, NoFall, NoPush, Nametags, NoHurtCam.'
  },
  {
    id: 'cfg-default-legit',
    name: 'default_legit.cfg',
    server: 'Legit',
    playstyle: 'Legit / Closet',
    author: 'Dexum',
    downloads: 0,
    rating: 5,
    lastUpdated: 'Стартовый',
    modulesCount: 6,
    description: 'Легитный пресет: AimAssist, TriggerBot (только криты), Nametags, NoHurtCam, AntiBlind, NoBob.'
  },
  {
    id: 'cfg-pvp-full',
    name: 'pvp_full.cfg',
    server: 'Semi-Rage',
    playstyle: 'Semi-Rage',
    author: 'Dexum',
    downloads: 0,
    rating: 5,
    lastUpdated: 'Стартовый',
    modulesCount: 14,
    description: 'Максимальный набор для PvP: все combat-модули + визуал + утилиты (ChestStealer, NoDelay, NoInteract).'
  }
];

// Очищено: больше нет фейковых аккаунтов и админов в коде
export const INITIAL_USERS: User[] = [];
export const INITIAL_ORDERS: Order[] = [];

export const FAQ_ITEMS = [
  {
    question: 'Какие версии Minecraft поддерживаются?',
    answer: 'Клиент работает на Fabric Loader для Minecraft 26.2. NeoForge и другие лоадеры не поддерживаются.'
  },
  {
    question: 'Как установить клиент?',
    answer: 'Установите Fabric Loader для 26.2, скачайте jar-файл клиента из личного кабинета и положите его в папку mods. При первом запуске клиент создаст папку dexum/ в директории игры.'
  },
  {
    question: 'Что умеет клиент?',
    answer: 'Клиент включает 28 модулей: бой (Aura, TriggerBot, AimAssist, NoFriendDamage), движение (Sprint, NoSlow, NoPush, AutoSneak, NoFall), рендер (ClickGui, Nametags, FriendESP/HUD/Arrow, FreeCam, Zoom, NoBob, NoFov, AntiBlind, NoHurtCam, FullBright, Watermark), игрок (NoDelay, NoInteract, ChestStealer, AutoRespawn, StreamerMode) и мир (TimeChanger). Полный список — в разделе «Функции».'
  },
  {
    question: 'Как работает привязка HWID?',
    answer: 'При первом запуске клиент привязывается к железу вашего ПК. Если вы переустановили Windows или сменили комплектующие — сбросьте HWID в личном кабинете на сайте.'
  },
  {
    question: 'Какие способы оплаты принимаются?',
    answer: 'Оплата через FunPay (безопасная сделка), СБП, банковские карты и криптовалюту. Ключ выдаётся автоматически после подтверждения платежа.'
  },
  {
    question: 'Есть ли возврат средств?',
    answer: 'Возврат возможен в течение 24 часов после покупки, если ключ не был активирован. После активации лицензии возврат не производится.'
  }
];