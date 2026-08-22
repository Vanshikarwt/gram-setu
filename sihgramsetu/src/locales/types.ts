/**
 * GramSetu Locale Type System
 * All locale files must satisfy this interface.
 * Adding a new language = create a new file implementing this type.
 */
export interface Locale {
  // ── Language meta ──────────────────────────────────────────────────────────
  lang: {
    name: string;          // Display name of the language itself
    code: 'en' | 'hi' | 'hinglish';
    speechLang: string;    // BCP-47 tag for Web Speech API
  };

  // ── Language Selection Screen ───────────────────────────────────────────────
  langSelect: {
    heading: string;
    subheading: string;
    continue: string;
    hindi: string;
    english: string;
    hinglish: string;
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    home: string;
    search: string;
    bazaar: string;
    chat: string;
    profile: string;
  };

  // ── App Header ──────────────────────────────────────────────────────────────
  header: {
    consumerMode: string;
    providerMode: string;
  };

  // ── Auth ────────────────────────────────────────────────────────────────────
  auth: {
    login: string;
    loginBtn: string;
    loggingIn: string;
    logout: string;
    logoutConfirmTitle: string;
    logoutConfirmMsg: string;
    logoutYes: string;
    signup: string;
    signupBtn: string;
    registering: string;
    noAccount: string;
    hasAccount: string;
    registerHere: string;
    loginHere: string;
    tagline: string;
    mobileLabel: string;
    passwordLabel: string;
    testTip: string;
  };

  // ── Signup ──────────────────────────────────────────────────────────────────
  signup: {
    nameLabel: string;
    phoneLabel: string;
    passwordLabel: string;
    villageLabel: string;
    stateLabel: string;
    langLabel: string;
    roleLabel: string;
    roleBoth: string;
    roleConsumer: string;
    roleProvider: string;
    alreadyHaveAccount: string;
  };

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile: {
    heading: string;
    mobileLabel: string;
    locationLabel: string;
    langLabel: string;
    changeLanguage: string;
    helpSupport: string;
    guestSession: string;
    registeredProfile: string;
    langPanelHeading: string;
    langPanelSave: string;
    langPanelCancel: string;
  };

  // ── General UI ──────────────────────────────────────────────────────────────
  common: {
    cancel: string;
    save: string;
    submit: string;
    back: string;
    next: string;
    done: string;
    close: string;
    loading: string;
    search: string;
    reset: string;
    confirm: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    all: string;
    edit: string;
    delete: string;
    add: string;
    create: string;
    publish: string;
    send: string;
    refresh: string;
    tryAgain: string;
    showAll: string;
    noResults: string;
    noResultsDesc: string;
    available: string;
    unavailable: string;
    optional: string;
    required: string;
    error: string;
    success: string;
  };

  // ── Status Labels ───────────────────────────────────────────────────────────
  status: {
    pending: string;
    accepted: string;
    rejected: string;
    active: string;
    completed: string;
    cancelled: string;
    paid: string;
  };

  // ── Home ─────────────────────────────────────────────────────────────────
  home: {
    discoverTab: string;
    bookingsTab: string;
    addListing: string;
    editListing: string;
    listingsTab: string;
    requestsTab: string;
    noListings: string;
    noListingsDesc: string;
    noBookings: string;
    noBookingsDesc: string;
    createFirstListing: string;
    // Category cards
    categories: string;
    catMachinery: string;
    catResidue: string;
    catLabor: string;
    catStorage: string;
    catOthers: string;
    backToCategories: string;
    // Filter panel
    filterHeading: string;
    priceFilter: string;
    ratingFilter: string;
    locationFilter: string;
    locationFilterPlaceholder: string;
    distanceScaleFilter: string;
    maxDistanceLabel: string;
    minPrice: string;
    maxPrice: string;
    anyRating: string;
    applyFilters: string;
    clearFilters: string;
    filtersActive: string;
    // Discovery sections
    nearbyResources: string;
    availableNow: string;
    recommended: string;
    recentlyViewed: string;
    noNearby: string;
    noRecommended: string;
    noRecentlyViewed: string;
    viewAll: string;
    loading: string;
    reviews: string;
  };

  // ── Search ──────────────────────────────────────────────────────────────────
  searchPage: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    locationPlaceholder: string;
    results: string;
    searching: string;
    resetFilters: string;
    noResults: string;
    noResultsDesc: string;
    showAll: string;
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  filters: {
    all: string;
    machinery: string;
    labor: string;
    cropResidue: string;
    storage: string;
    agriProduct: string;
  };

  // ── Listings ────────────────────────────────────────────────────────────────
  listing: {
    machinery: string;
    labor: string;
    cropResidue: string;
    storage: string;
    agriProduct: string;
    bookNow: string;
    viewDetails: string;
    contactProvider: string;
    perHour: string;
    perDay: string;
    perAcre: string;
    perQuintal: string;
    perKg: string;
    perTonne: string;
    stockLabel: string;
    capacityLabel: string;
    lowStockWarning: string;
    providerLabel: string;
    locationLabel: string;
    categoryLabel: string;
    active: string;
    inactive: string;
    statusLabel: string;
    utilizationLabel: string;
  };

  // ── Booking ─────────────────────────────────────────────────────────────────
  booking: {
    heading: string;
    bookNow: string;
    sendRequest: string;
    requestSent: string;
    awaitApproval: string;
    dateLabel: string;
    durationLabel: string;
    totalLabel: string;
    hoursLabel: string;
    daysLabel: string;
    hr: string;
    day: string;
    qtyLabel: string;
    hourlyBookingMode: string;
    dailyBookingMode: string;
    howManyHours: string;
    numberOfDays: string;
    addAnotherDate: string;
    ratePerHr: string;
    ratePerDay: string;
    notesLabel: string;
    notesPlaceholder: string;
    confirm: string;
    success: string;
    failed: string;
    viewBookings: string;
    incomingHeading: string;
    myHeading: string;
    noIncoming: string;
    noIncomingDesc: string;
    noBookings: string;
    noBookingsDesc: string;
    noMyBookings: string;
    noMyBookingsDesc: string;
    accept: string;
    reject: string;
    markActive: string;
    markComplete: string;
    reviewBtn: string;
    leaveReview: string;
    reviewed: string;
    completed: string;
    payNow: string;
    paidAwaitingStart: string;
    trackOrder: string;
    track: string;
    trackJob: string;
  };

  // ── Payment ─────────────────────────────────────────────────────────────────
  payment: {
    heading: string;
    subheading: string;
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
    payBtn: string;
    processing: string;
    success: string;
    failed: string;
    totalLabel: string;
    orderSummary: string;
  };

  // ── Review ──────────────────────────────────────────────────────────────────
  review: {
    heading: string;
    ratingLabel: string;
    commentLabel: string;
    commentPlaceholder: string;
    submit: string;
    successTitle: string;
    successMsg: string;
    noRatingError: string;
    failedError: string;
  };

  // ── Chat ────────────────────────────────────────────────────────────────────
  chat: {
    heading: string;
    subheading: string;
    noMessages: string;
    noMessagesDesc: string;
    placeholder: string;
    online: string;
    startConversation: string;
    startConversationDesc: string;
  };

  // ── Bazaar ──────────────────────────────────────────────────────────────────
  bazaar: {
    heading: string;
    subheading: string;
    filterAll: string;
    filterNeed: string;
    filterOffer: string;
    posts: string;
    noPostsTitle: string;
    noPostsDesc: string;
    createFirst: string;
    createPost: string;
    typeLabel: string;
    needType: string;
    offerType: string;
    descLabel: string;
    locationLabel: string;
    publish: string;
    needPlaceholder: string;
    offerPlaceholder: string;
    contactBtn: string;
    postedBy: string;
    ago: string;
    justNow: string;
    minAgo: string;
    hrAgo: string;
    dayAgo: string;
  };

  // ── Notifications ───────────────────────────────────────────────────────────
  notif: {
    heading: string;
    unread: string;
    markAllRead: string;
    none: string;
    noneDesc: string;
    tapToRead: string;
    justNow: string;
    minAgo: string;
    hrAgo: string;
    dayAgo: string;
  };

  // ── Provider Analytics ──────────────────────────────────────────────────────
  analytics: {
    heading: string;
    revenue: string;
    jobsCompleted: string;
    activeListings: string;
    pendingRequests: string;
    pendingTap: string;
    emptyTitle: string;
    emptyDesc: string;
    forecastHeading: string;
    forecastBadge: string;
  };

  // ── Tracking ─────────────────────────────────────────────────────────────────
  tracking: {
    heading: string;
    ordered: string;
    confirmed: string;
    dispatched: string;
    arriving: string;
    delivered: string;
    estimatedLabel: string;
    deliveryIn: string;
    days: string;
    close: string;
  };

  // ── Validation errors ───────────────────────────────────────────────────────
  validation: {
    required: string;
    invalidPhone: string;
    passwordRequired: string;
    nameRequired: string;
    villageRequired: string;
    stateRequired: string;
    contentRequired: string;
    locationRequired: string;
    ratingRequired: string;
    dateRequired: string;
    qtyRequired: string;
    quantityMin: string;
    cardNumberRequired: string;
    cardNameRequired: string;
    expiryRequired: string;
    cvvRequired: string;
  };

  // ── Listing Form ─────────────────────────────────────────────────────────────
  listingForm: {
    addHeading: string;
    editHeading: string;
    typeLabel: string;
    titleLabel: string;
    descLabel: string;
    priceLabel: string;
    unitLabel: string;
    locationLabel: string;
    categoryLabel: string;
    stockLabel: string;
    capacityLabel: string;
    statusLabel: string;
    activeStatus: string;
    inactiveStatus: string;
    saveBtn: string;
    savingBtn: string;
    cancelBtn: string;
    titlePlaceholder: string;
    descPlaceholder: string;
    locationPlaceholder: string;
    // Photo upload
    photosLabel: string;
    photosRequired: string;
    photosOptional: string;
    addPhoto: string;
    photoRequired: string;
    // Availability dates
    availabilityLabel: string;
    addDateLabel: string;
    noDateSelected: string;
    invalidDate: string;
    duplicateDate: string;
    pastDate: string;
  };

  // ── Empty States ─────────────────────────────────────────────────────────────
  emptyState: {
    searchTitle: string;
    searchDesc: string;
    searchAction: string;
    chatTitle: string;
    chatDesc: string;
    noListingsTitle: string;
    noListingsDesc: string;
    noBookingsTitle: string;
    noBookingsDesc: string;
    noIncomingTitle: string;
    noIncomingDesc: string;
    noBazaarTitle: string;
    noBazaarDesc: string;
  };
}
