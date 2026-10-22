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
    supportedVersions: ['26.2'],
    supportedServers: ['Fabric 26.2'],
    features: [
      'Все 28 модулей клиента',
      'ClickGui и все HUD-элементы',
      'Система конфигов и команд',
      'Friend-система',
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
    supportedVersions: ['26.2'],
    supportedServers: ['Fabric 26.2'],
    features: [
      'Все 28 модулей клиента',
      'ClickGui и базовые HUD-элементы',
      'Система конфигов',
      'Обновления в течение срока'
    ],
    downloadSize: '—',
    version: 'Fabric 26.2'
  }
];

export const MODULES: SoftwareModule[] = [
  // ── Combat ────────────────────────────────────────────────────────
  {
    id: 'aura',
    name: 'Aura',
    category: 'Combat',
    description: 'Автоматическая атака цели с silent-ротацией, приоритетом выбора цели (прицел/дистанция/HP), крит-чеком и дистанцией до 6 блоков.',
    bypasses: ['Vanilla Packet'],
    hotkey: 'R',
    iconName: 'Swords',
    isPopular: true
  },
  {
    id: 'triggerbot',
    name: 'TriggerBot',
    category: 'Combat',
    description: 'Автоматический удар, когда прицел наведён на цель. Поддерживает крит-режим и рандомизацию задержки.',
    bypasses: ['Vanilla Raycast'],
    hotkey: 'X',
    iconName: 'Crosshair'
  },
  {
    id: 'aimassist',
    name: 'AimAssist',
    category: 'Combat',
    description: 'Плавное притяжение прицела к цели при движении мыши. GCD-квантизация, FOV, настраиваемая сила.',
    bypasses: ['GCD Quantization'],
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

  // ── Movement ──────────────────────────────────────────────────────
  {
    id: 'sprint',
    name: 'Sprint',
    category: 'Movement',
    description: 'Автоматическое удержание спринта при движении с проверкой голода и эффектов.',
    bypasses: ['Vanilla Input'],
    iconName: 'FastForward'
  },
  {
    id: 'noslow',
    name: 'NoSlow',
    category: 'Movement',
    description: 'Убирает замедление при использовании предметов (еда, щит, лук). Режим Vanilla.',
    bypasses: ['Vanilla Only'],
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
    bypasses: ['Vanilla Input'],
    iconName: 'Footprints'
  },
  {
    id: 'nofall',
    name: 'NoFall',
    category: 'Movement',
    description: 'Отмена урона от падения. Режимы Vanilla и Packet.',
    bypasses: ['Vanilla Only'],
    iconName: 'Shield'
  },

  // ── Render ────────────────────────────────────────────────────────
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
    description: 'HUD с ником, FPS и временем. Перетаскивается мышью, сохраняет позицию в конфиг.',
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
    description: 'Подсветка друзей рамкой и линией через стены (2D-проекция).',
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
    bypasses: ['Vanilla Packet'],
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

  // ── Player ────────────────────────────────────────────────────────
  {
    id: 'nodelay',
    name: 'NoDelay',
    category: 'Player',
    description: 'Убирает задержку прыжка, ломания блоков и правого клика.',
    bypasses: ['Vanilla Delay'],
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
    description: 'Автоматическое обчищение сундуков с рандомизированной задержкой и случайным порядком.',
    bypasses: ['Vanilla Packet'],
    iconName: 'Package',
    isPopular: true
  },
  {
    id: 'autorespawn',
    name: 'AutoRespawn',
    category: 'Player',
    description: 'Автоматическое возрождение после смерти с настраиваемой задержкой.',
    bypasses: ['Vanilla Packet'],
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

  // ── World ─────────────────────────────────────────────────────────
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
    server: 'Any',
    playstyle: 'Rage / HvH',
    author: 'Dexum',
    downloads: 0,
    rating: 5,
    lastUpdated: 'Стартовый',
    modulesCount: 12,
    description: 'Базовый HvH-пресет: Aura, TriggerBot, NoSlow, Sprint, NoFall, NoPush. Скачайте и положите в dexum/configs/, затем .config load default_hvh'
  },
  {
    id: 'cfg-default-legit',
    name: 'default_legit.cfg',
    server: 'Any',
    playstyle: 'Legit / Closet',
    author: 'Dexum',
    downloads: 0,
    rating: 5,
    lastUpdated: 'Стартовый',
    modulesCount: 8,
    description: 'Легитный пресет: AimAssist, TriggerBot (только криты), Nametags, NoHurtCam. Минимальный визуальный шум.'
  },
  {
    id: 'cfg-pvp-full',
    name: 'pvp_full.cfg',
    server: 'Any',
    playstyle: 'Semi-Rage',
    author: 'Dexum',
    downloads: 0,
    rating: 5,
    lastUpdated: 'Стартовый',
    modulesCount: 20,
    description: 'Максимальный набор для PvP: все combat-модули + визуал + утилиты (ChestStealer, NoDelay, NoInteract).'
  }
];

// ОСТАЛЬНОЕ ОСТАВЛЯЕМ КАК ЕСТЬ (INITIAL_USERS, INITIAL_ORDERS — это тестовые данные)
// Но INITIAL_USERS хардкодит admin/password — это уйдёт после подключения бэкенда.

export const INITIAL_USERS: User[] = [
<<<<<<< HEAD
  {
    id: 'usr-admin',
    name: 'Alex Morozov (Admin)',
    email: 'admin@dexum.gg',
    role: 'admin',
    password: 'adminpassword123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    minecraftNick: 'DexumOwner',
    hwid: 'HWID-9F8A-22B1-8C09-E81D-DEXUM',
    registeredAt: '2025-01-10',
    balance: 15400,
    isEmailVerified: true,
    totpEnabled: false,
    licenses: [
      {
        id: 'lic-admin-1',
        productId: 'dexum-lifetime',
        productName: 'Dexum Client Lifetime (1.21)',
        key: 'DXM-LIFE-ADMIN-9999-DEV',
        status: 'active',
        expiresAt: 'Lifetime',
        daysRemaining: 'unlimited',
        hwid: 'HWID-9F8A-22B1-8C09-E81D-DEXUM',
        hwidResetAvailable: true,
        lastHwidReset: null,
        activatedAt: '2025-01-10'
      },
      {
        id: 'lic-admin-2',
        productId: 'dexum-spoofer',
        productName: 'Dexum HWID Spoofer',
        key: 'SPOOF-LIFE-ADM-777',
        status: 'active',
        expiresAt: 'Lifetime',
        daysRemaining: 'unlimited',
        hwid: 'HWID-9F8A-22B1-8C09-E81D-DEXUM',
        hwidResetAvailable: true,
        lastHwidReset: null,
        activatedAt: '2025-01-10'
      }
    ]
  },
  {
    id: 'usr-buyer',
    name: 'xX_ShadowPvP_Xx',
    email: 'shadow.pvp@gmail.com',
    role: 'buyer',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    minecraftNick: 'Shadow_Demon77',
    hwid: 'HWID-41C8-99D0-55A1-18F2-CLIENT',
    registeredAt: '2026-02-14',
    balance: 500,
    isEmailVerified: true,
    totpEnabled: false,
    licenses: [
      {
        id: 'lic-buyer-1',
        productId: 'dexum-lifetime',
        productName: 'Dexum Client Lifetime (1.21)',
        key: 'DXM-LIFE-8821-9940-PVPGOD',
        status: 'active',
        expiresAt: 'Lifetime',
        daysRemaining: 'unlimited',
        hwid: 'HWID-41C8-99D0-55A1-18F2-CLIENT',
        hwidResetAvailable: true,
        lastHwidReset: '2026-02-15',
        activatedAt: '2026-02-14'
      },
      {
        id: 'lic-buyer-2',
        productId: 'dexum-configs-vip',
        productName: 'VIP Cloud Config Pack (1.21)',
        key: 'CFG-PACK-VIP-3391',
        status: 'active',
        expiresAt: 'Lifetime',
        daysRemaining: 'unlimited',
        hwid: 'HWID-41C8-99D0-55A1-18F2-CLIENT',
        hwidResetAvailable: true,
        lastHwidReset: null,
        activatedAt: '2026-02-14'
      }
    ]
  },
  {
    id: 'usr-new',
    name: 'Steve_Crafter',
    email: 'steve@mine.ru',
    role: 'user',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    minecraftNick: 'StevePvP2026',
    hwid: null,
    registeredAt: '2026-03-01',
    balance: 0,
    isEmailVerified: false,
    totpEnabled: false,
    licenses: []
  }
=======
  // ... оставить существующий код, но перед релизом УДАЛИТЬ и заменить на реальных из БД
>>>>>>> 362b3dc (Initial commit: Dexum Client site)
];

export const INITIAL_ORDERS: Order[] = [];

export const FAQ_ITEMS = [
  {
    question: 'Какие версии Minecraft поддерживаются?',
    answer: 'Клиент работает на Fabric Loader для Minecraft 26.2. NeoForge и другие лоадеры не поддерживаются.'
  },
  {
    question: 'Как установить клиент?',
    answer: 'Установите Fabric Loader для 26.2, скачайте jar-файл клиента из личного кабинета и положите его в папку mods. При первом запуске клиент создаст папку dexum/ в директории игры (рядом с папкой mods).'
  },
  {
    question: 'Что умеет клиент?',
    answer: 'Клиент включает модули для боя (Aura, TriggerBot, AimAssist, NoFriendDamage), движения (Sprint, NoSlow, NoPush, AutoSneak, NoFall), рендера (ClickGui, Nametags, FriendESP/HUD/Arrow, FreeCam, Zoom, NoBob, NoFov, AntiBlind, NoHurtCam, FullBright, Watermark) и игрока (NoDelay, NoInteract, ChestStealer, AutoRespawn, StreamerMode, TimeChanger). Полный список — в разделе «Функции».'
  },
  {
    question: 'Как работает привязка HWID?',
    answer: 'При первом запуске клиент привязывается к железу вашего ПК. Если вы переустановили Windows или сменили комплектующие — сбросьте HWID в личном кабинете на сайте (доступно 1 раз в 30 дней).'
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