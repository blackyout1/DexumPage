import { SoftwareProduct, SoftwareModule, CloudConfig, User, Order } from '../types';

export const PRODUCTS: SoftwareProduct[] = [
  {
    id: 'dexum-lifetime',
    name: 'Dexum Client Lifetime',
    tagline: 'Максимальный доступ навсегда со всеми будущими обновлениями под Minecraft 1.21',
    category: 'client',
    price: 1990,
    originalPrice: 2990,
    durationLabel: 'Навсегда (Lifetime)',
    popular: true,
    featured: true,
    supportedVersions: ['1.21'],
    supportedServers: ['GrimAC Servers', 'SunRise', 'SpamPvP', 'NexusGrief'],
    features: [
      'Все модули Rage / Legit / Anarchy',
      'Бессрочный доступ и автообновления 1.21',
      'Специализированные обходы под GrimAC 2.3.8',
      'Облачные конфиги и приватный Discord',
      'Приоритетный сброс HWID',
      'Встроенный HWID Spoofer',
      'Кастомный HUD, ClickGUI и TargetHUD',
      'Поддержка Fabric 1.21 и NeoForge 1.21'
    ],
    badge: 'ХИТ ПРОДАЖ',
    downloadSize: '42.8 MB',
    version: 'v4.4.2 (1.21)'
  },
  {
    id: 'dexum-90-days',
    name: 'Dexum Client 90 Дней',
    tagline: 'Идеальный баланс для активного игрового сезона и клановых варов на 1.21',
    category: 'client',
    price: 990,
    originalPrice: 1390,
    durationLabel: '3 Месяца (90 дней)',
    popular: false,
    featured: false,
    supportedVersions: ['1.21'],
    supportedServers: ['GrimAC Servers', 'SunRise', 'SpamPvP'],
    features: [
      'Полный функционал клиента под 1.21',
      'Оптимизация под античит GrimAC',
      'Доступ к базе облачных конфигов',
      'Техподдержка в Telegram',
      'Возможность продления со скидкой 20%'
    ],
    badge: 'ВЫГОДНО',
    downloadSize: '42.8 MB',
    version: 'v4.4.2 (1.21)'
  },
  {
    id: 'dexum-30-days',
    name: 'Dexum Client 30 Дней',
    tagline: 'Быстрый старт для теста всех топовых функций на серверах с GrimAC 1.21',
    category: 'client',
    price: 490,
    durationLabel: '1 Месяц (30 дней)',
    popular: false,
    featured: false,
    supportedVersions: ['1.21'],
    supportedServers: ['GrimAC Servers', 'SunRise'],
    features: [
      'Все боевые и визуальные модули 1.21',
      'Обход античита GrimAC 2.3.8',
      'Базовый сброс HWID',
      'Автообновление лаунчера'
    ],
    downloadSize: '42.8 MB',
    version: 'v4.4.2 (1.21)'
  },
  {
    id: 'dexum-configs-vip',
    name: 'VIP Cloud Config Pack (1.21)',
    tagline: 'Коллекция настроенных CFG от топ-дуэлянтов под GrimAC на 1.21',
    category: 'configs',
    price: 290,
    originalPrice: 450,
    durationLabel: 'Вечный доступ к паку',
    popular: false,
    featured: false,
    supportedVersions: ['1.21'],
    supportedServers: ['GrimAC Servers', 'SunRise', 'SpamPvP'],
    features: [
      '45+ готовых конфигов 1.21 (HvH, Legit, Anarchy)',
      'Кастомные шрифты и темы оформления GUI',
      'Авто-подгрузка в игре через кнопку Cloud',
      'Обновления под новые фиксы GrimAC'
    ],
    badge: 'CFG PACK',
    downloadSize: '8.4 MB',
    version: 'v2.8 (1.21)'
  },
  {
    id: 'dexum-spoofer',
    name: 'Dexum HWID Spoofer',
    tagline: 'Обход блокировок по железу на лаунчерах и серверах 1.21',
    category: 'spoofer',
    price: 390,
    originalPrice: 600,
    durationLabel: 'Lifetime Лицензия',
    popular: false,
    featured: false,
    supportedVersions: ['1.21'],
    supportedServers: ['Все сервера и лаунчеры 1.21'],
    features: [
      'Спуфинг MAC, HDD/SSD Serial, GPU ID, BIOS GUID',
      'Очистка логов Minecraft 1.21 и Windows',
      'Запуск в 1 клик перед игрой',
      'Безопасно для ОС'
    ],
    badge: 'SPOOFER',
    downloadSize: '12.1 MB',
    version: 'v3.1 Pro'
  }
];

export const MODULES: SoftwareModule[] = [
  {
    id: 'killaura',
    name: 'KillAura (Aura 360°)',
    category: 'Combat',
    description: 'Автоматическая атака целей с настраиваемым радиусом, ротациями под GrimAC, кастомным CPS и авто-выбором лучшего оружия.',
    bypasses: ['GrimAC 2.3.8', 'Raycast Legit', 'Vanilla Packet'],
    hotkey: 'R',
    iconName: 'Swords',
    isPopular: true
  },
  {
    id: 'targetstrafe',
    name: 'TargetStrafe',
    category: 'Combat',
    description: 'Плавное кружение вокруг цели с динамической дистанцией, уклонением от стрел и расчетом препятствий.',
    bypasses: ['GrimAC', 'Smart Raytrace'],
    hotkey: 'F',
    iconName: 'Compass',
    isPopular: true
  },
  {
    id: 'velocity',
    name: 'Velocity (Анти-Отдача)',
    category: 'Combat',
    description: 'Полное или процентное отключение отталкивания при ударах, взрывах динамита и выстрелах из лука под GrimAC.',
    bypasses: ['GrimAC Velocity', 'Vanilla Packet'],
    hotkey: 'V',
    iconName: 'Shield',
    isPopular: true
  },
  {
    id: 'autototem',
    name: 'AutoTotem & GApple',
    category: 'Combat',
    description: 'Подстановка тотема бессмертия во вторую руку при критическом здоровье + авто-поедание золотых яблок.',
    bypasses: ['GrimAC 1.21', 'Vanilla Packet'],
    hotkey: 'T',
    iconName: 'HeartHandshake',
    isPopular: true
  },
  {
    id: 'criticals',
    name: 'Criticals (Криты)',
    category: 'Combat',
    description: 'Каждый удар наносится с эффектом падения и критическим уроном даже при беге по земле или стоя на месте.',
    bypasses: ['GrimAC Packet', 'Mini-Hop'],
    iconName: 'Zap'
  },
  {
    id: 'triggerbot',
    name: 'TriggerBot & Reach',
    category: 'Combat',
    description: 'Легитный триггер с дистанцией удара до 3.8–6.0 блоков и рандомизацией задержек.',
    bypasses: ['GrimAC Legit', 'Raycast Bypass'],
    hotkey: 'X',
    iconName: 'Crosshair'
  },
  {
    id: 'fly',
    name: 'Grim Fly',
    category: 'Movement',
    description: 'Полет на серверах через манипуляцию пакетами под античит GrimAC.',
    bypasses: ['GrimAC Exploit', 'Packet Mode'],
    hotkey: 'G',
    iconName: 'Plane',
    isPopular: true
  },
  {
    id: 'speed',
    name: 'Speed (Bhop & Strafe)',
    category: 'Movement',
    description: 'Ускорение бега, прыжки баннихопом и быстрый стрейф по воде и льду под GrimAC.',
    bypasses: ['GrimAC LowHop', 'Strafe 1.21'],
    hotkey: 'B',
    iconName: 'FastForward'
  },
  {
    id: 'noslow',
    name: 'NoSlowdown (NoSlow)',
    category: 'Movement',
    description: 'Отсутствие замедления при блокировании мечом/щитом, натягивании тетивы лука, поедании еды, булаве и паутине.',
    bypasses: ['GrimAC NoSlow', 'Vanilla Packet'],
    iconName: 'Footprints'
  },
  {
    id: 'longjump',
    name: 'LongJump & HighJump',
    category: 'Movement',
    description: 'Дальние прыжки через каньоны и перепрыгивание препятствий на скорости.',
    bypasses: ['GrimAC Damage Boost', 'Bow Boost'],
    iconName: 'ArrowUpRight'
  },
  {
    id: 'esp',
    name: '3D ESP & Glowing Chams',
    category: 'Render',
    description: 'Подсветка игроков сквозь стены, 3D боксы, скелеты, линии трассировки, полоски здоровья и брони.',
    bypasses: ['Клиентский рендер'],
    hotkey: 'Z',
    iconName: 'Eye',
    isPopular: true
  },
  {
    id: 'targethud',
    name: 'TargetHUD & UI',
    category: 'Render',
    description: 'Информационная панель противника: ник, HP, броня, статус зелий и анимация урона.',
    bypasses: ['Визуальный модуль'],
    iconName: 'Layout'
  },
  {
    id: 'itemesp',
    name: 'Storage & Item ESP',
    category: 'Render',
    description: 'Подсветка сундуков, шалкеров, воронок, элитр, алмазной руды, ветровых зарядов и выпавших предметов.',
    bypasses: ['Anti-Xray Bypass'],
    iconName: 'Package'
  },
  {
    id: 'scaffold',
    name: 'Scaffold (Grim Bridge)',
    category: 'Player',
    description: 'Автоматическая постройка мостов под собой на бегу спиной вперед.',
    bypasses: ['GrimAC Scaffold', 'Legit Bridge'],
    hotkey: 'H',
    iconName: 'Grid',
    isPopular: true
  },
  {
    id: 'cheststealer',
    name: 'ChestStealer & AutoArmor',
    category: 'Player',
    description: 'Быстрое обчищение сундуков и авто-экипировка лучшей брони из инвентаря.',
    bypasses: ['GrimAC Silent', 'No Open Anim'],
    iconName: 'ShieldAlert'
  },
  {
    id: 'anticheat-disabler',
    name: 'GrimAC Packet Disabler',
    category: 'Bypasses',
    description: 'Модуль отсылки специальных пакетов для обхода проверок античита GrimAC на версии 1.21.',
    bypasses: ['GrimAC 2.3.8', 'GrimAC Exploit'],
    iconName: 'Cpu',
    isPopular: true
  }
];

export const CLOUD_CONFIGS: CloudConfig[] = [
  {
    id: 'cfg-grim-hvh',
    name: 'GrimAC_HvH_Rage_1.21.cfg',
    server: 'GrimAC (1.21)',
    playstyle: 'Rage / HvH',
    author: 'Dexum_Dev',
    downloads: 14820,
    rating: 4.9,
    lastUpdated: 'Сегодня, 14:20',
    modulesCount: 38,
    description: 'Конфиг под дуэли и аир-дропы на серверах GrimAC 1.21. Настроен KillAura 3.65b, AutoTotem, GrimFly и TargetStrafe.'
  },
  {
    id: 'cfg-grim-anarchy',
    name: 'GrimAC_Anarchy_1.21.cfg',
    server: 'GrimAC (1.21)',
    playstyle: 'Anarchy',
    author: 'ShadowGrim',
    downloads: 9450,
    rating: 4.8,
    lastUpdated: 'Вчера',
    modulesCount: 32,
    description: 'Идеален для рейда баз и гриферства на 1.21. Включен NoSlow, AutoTotem, Speed, FastBreak и StorageESP.'
  },
  {
    id: 'cfg-grim-legit',
    name: 'GrimAC_Legit_Closet_1.21.cfg',
    server: 'GrimAC (1.21)',
    playstyle: 'Legit / Closet',
    author: 'VortexLegit',
    downloads: 18900,
    rating: 5.0,
    lastUpdated: '3 дня назад',
    modulesCount: 18,
    description: 'Легитная конфигурация под GrimAC 1.21: автокликер 12-16 CPS, Reach 3.15, FastPlace.'
  },
  {
    id: 'cfg-sunrise-rage',
    name: 'SunRise_GrimAC_1.21.cfg',
    server: 'SunRise (1.21)',
    playstyle: 'Rage / HvH',
    author: 'DeltaMaster',
    downloads: 4120,
    rating: 4.7,
    lastUpdated: '5 дней назад',
    modulesCount: 41,
    description: 'Rage конфигурация для 1.21 с GrimAC. Полет, дальнобойная аура и Scaffold.'
  }
];

export const INITIAL_USERS: User[] = [
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
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-901',
    userId: 'usr-buyer',
    userName: 'xX_ShadowPvP_Xx',
    productId: 'dexum-lifetime',
    productName: 'Dexum Client Lifetime (1.21)',
    amount: 1990,
    paymentMethod: 'sbp',
    status: 'completed',
    date: '2026-02-14 18:42',
    licenseKey: 'DXM-LIFE-8821-9940-PVPGOD'
  },
  {
    id: 'ord-902',
    userId: 'usr-buyer',
    userName: 'xX_ShadowPvP_Xx',
    productId: 'dexum-configs-vip',
    productName: 'VIP Cloud Config Pack (1.21)',
    amount: 290,
    paymentMethod: 'card',
    status: 'completed',
    date: '2026-02-14 18:45',
    licenseKey: 'CFG-PACK-VIP-3391'
  },
  {
    id: 'ord-903',
    userId: 'usr-782',
    userName: 'KillauraKing',
    productId: 'dexum-30-days',
    productName: 'Dexum Client 30 Дней (1.21)',
    amount: 490,
    paymentMethod: 'crypto',
    status: 'completed',
    date: '2026-03-02 12:10',
    licenseKey: 'DXM-30D-4410-8821-FTWIN'
  },
  {
    id: 'ord-904',
    userId: 'usr-194',
    userName: 'VortexAnarchy',
    productId: 'dexum-lifetime',
    productName: 'Dexum Client Lifetime (1.21)',
    amount: 1990,
    paymentMethod: 'sbp',
    status: 'completed',
    date: '2026-03-02 15:33',
    licenseKey: 'DXM-LIFE-9912-4412-RWGOD'
  }
];

export const FAQ_ITEMS = [
  {
    question: 'Как установить клиент Dexum 1.21 после покупки?',
    answer: 'После оплаты вы мгновенно получаете лицензионный ключ и доступ к скачиванию в личном кабинете. Скачайте официальный лаунчер DexumLauncher.exe (или .jar версию для Fabric / NeoForge 1.21), запустите его, введите ваш ключ или логин и нажмите «Играть».'
  },
  {
    question: 'На каких серверах Minecraft 1.21 работают обходы?',
    answer: 'Клиент оптимизирован исключительно под сервера Minecraft 1.21 с античитом GrimAC (включая GrimAC 2.3.8).'
  },
  {
    question: 'Как работает привязка по HWID и сброс?',
    answer: 'Лицензия привязывается к вашему компьютеру (HWID) при первом запуске лаунчера. Если вы переустановили Windows или сменили комплектующие, вы можете сбросить HWID в Личном кабинете.'
  },
  {
    question: 'Какие способы оплаты принимаются?',
    answer: 'Мы принимаем СБП (Система Быстрых Платежей), Банковские карты (МИР, Visa, Mastercard), ЮMoney, Криптовалюту (USDT TRC-20, TON, BTC, TRX) и баланс аккаунта.'
  },
  {
    question: 'Что делать, если возникли вопросы или нужна помощь с настройкой 1.21?',
    answer: 'В нашем Telegram-канале и Discord-сообществе работает техподдержка. Также в клиенте есть база готовых облачных конфигов 1.21 от разработчиков.'
  }
];
