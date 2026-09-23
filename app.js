
(() => {
  'use strict';

  const KEY = 'my-health-app-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const uid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const esc = (text) => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const trunc = (text, len = 180) => String(text ?? '').slice(0, len);
  const defaults = () => ({
    name: '', lang: 'en', theme: 'light', moods: [], favorites: [], ideas: [], memories: [],
    photos: [], wellness: {}, plans: [], aiConsent: false, aiEndpoint: ''
  });
  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return defaults();
      const s = {...defaults(), ...stored};
      for (const field of ['moods', 'favorites', 'ideas', 'memories', 'photos', 'plans']) {
        if (!Array.isArray(s[field])) s[field] = [];
      }
      if (!s.wellness || typeof s.wellness !== 'object' || Array.isArray(s.wellness)) s.wellness = {};
      if (!['fa', 'en'].includes(s.lang)) s.lang = 'en';
      if (!['dark', 'light'].includes(s.theme)) s.theme = 'light';
      return s;
    } catch { return defaults(); }
  }
  let state = load();
  let page = ['home','mood','planner','joy','journal','memories','wellness','settings'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  let selectedMood = null, joyCategory = 'all', joySearch = '', activeMemoryTab = 'memories', plannerDuration = 60, plannerEnergy = 'medium';
  let toastTimer;
  const tData = {
    en: {
      app:'My Health', home:'Overview', mood:'Mood tracker', planner:'Joy planner', joy:'My favorites',
      journal:'Ideas & journal', memories:'Memories & photos', wellness:'Wellness', settings:'Settings',
      main:'MY SPACE', collections:'MY LIFE', more:'More', today:'Today', private:'Private, just for you',
      heroTitle:'Make room for <span>more joy.</span>', heroText:'One beautiful space for your health, feelings, passions and all the little things that make life yours.',
      getInspired:'Plan a happy day', dashboardTitle:'Your wellness space', dashboardSub:'Little steps, beautiful progress. Welcome back!',
      quickMood:'How are you feeling right now?', quickMoodSub:'Every feeling belongs here. Check in with yourself.',
      moodNote:'Want to say a little more?', moodPlaceholder:'What has your day been like? (optional)', saveMood:'Save my mood',
      moodSaved:'Your check-in was saved', lastSeven:'Your last 7 days', lastSevenSub:'Your latest mood for each day; blank days mean no check-in.',
      feelingGreat:'Amazing', feelingGood:'Good', feelingOkay:'Okay', feelingLow:'Low', feelingAnxious:'Anxious', feelingTired:'Tired',
      checkinCount:'Check-ins', happyMoments:'Favorite things', savedIdeas:'Ideas captured', checkIn:'Mood check-in',
      water:'Water', movement:'Movement', sleep:'Sleep', glasses:'glasses', minutes:'min', hours:'hrs',
      joys:'Your happy things', joysSub:'Keep your personal feel-good collection close.',
      addFavorite:'Add favorite', viewAll:'See all', favoriteEmpty:'Your favorites are waiting!',
      favoriteEmptyText:'Add your favorite games, songs, movies, places and anything that makes you smile.',
      dailyInspiration:'A little reminder', quote:'You are allowed to enjoy the little things.', quoteBy:'A note to yourself',
      joyIdea:'A little something for you', joyIdeaText:'Turn your favorite things into little activities made for your day.',
      moodTitle:'Your feelings matter', moodSub:'Notice patterns, share what is on your mind, without judgment.',
      moodHistory:'Your check-in history', historyEmpty:'Your journey starts here', historyEmptyText:'Save your first mood to start seeing your personal patterns.',
      entry:'entry', entries:'entries', noNotes:'No note', delete:'Delete', deleteConfirm:'Delete this item?',
      latestMood:'Latest mood', noMood:'No check-ins yet', dailyTip:'You do not have to feel positive every day. All moods are welcome here.',
      plannerTitle:'Your day, your kind of joy', plannerSub:'Personalized activity ideas based on your mood, energy and favorite things.',
      plannerBanner:'A little joy looks different every day ✨', plannerBannerText:'Choose how you feel and how much time you have. Your on-device planner will find gentle, fun or creative ideas based on what you love.',
      timeAvailable:'Time available', energy:'Energy level', gentle:'Gentle', balanced:'Balanced', adventurous:'Energized',
      planNow:'Create my plan', todaysPlan:'Your personalized plan', regenerate:'New ideas', emptyPlan:'No plan yet',
      emptyPlanText:'Select your time and energy, then create a little adventure just for you.',
      plannerPrivate:'Your on-device suggestions work without an account or sending your entries anywhere.',
      plannerAI:'Optional external AI requires a private backend connection in Settings.',
      plannedFor:'Planned for', done:'Done', offline:'On-device smart suggestions', cloud:'External AI suggestions',
      joyTitle:'The things you love', joySub:'Your own feel-good library: games, movies, anime, music, books and more.',
      searchFavorite:'Search your favorites...', all:'All', games:'Games', movies:'Movies', anime:'Animation', music:'Music', books:'Books',
      travel:'Travel', hobbies:'Hobbies', people:'People & pets', others:'Other', addThing:'Add something you love',
      favoriteName:'What is it called?', favoriteNotes:'What do you love about it?', category:'Category',
      emoji:'Emoji (optional)', add:'Add to my collection', required:'Please enter a title.',
      journalTitle:'An idea is a little spark', journalSub:'Keep your thoughts, inventions, stories and everyday reflections.',
      newIdea:'New idea', ideas:'Your ideas', journalEmpty:'So many blank pages, so many possibilities',
      journalEmptyText:'Write down a game concept, a wild invention or a thought you want to remember.',
      ideaTitle:'Give your idea a name', ideaContent:'Tell the story...', ideaType:'Type',
      creative:'Creative', personal:'Personal', project:'Project', reflection:'Reflection',
      saveIdea:'Save idea', journalHint:'A little idea today can grow into something wonderful.',
      memoriesTitle:'Keep your favorite moments', memoriesSub:'Travel journals, meaningful days and photographs worth keeping.',
      photos:'Photos', addMemory:'Save a memory', addPhoto:'Add photo', memoriesEmpty:'Your story is just getting started',
      memoriesEmptyText:'Save a trip, a happy day or an unforgettable little moment.',
      memoryTitle:'What would you call this moment?', memoryContent:'What happened? Who was there? How did it feel?',
      memoryDate:'Date', saveMemory:'Save memory', photoTitle:'Give your photo a title', photoFile:'Choose a photo',
      photoHint:'Photos are compressed and saved in this browser. Large photo libraries may exceed browser storage.',
      photoEmpty:'No photos yet', photoEmptyText:'Add your favorite pictures and keep them together.',
      wellnessTitle:'Take care, your way', wellnessSub:'Lightweight personal tracking for small daily habits — not medical measurements.',
      wellnessHeroTitle:'Little habits, lovely days 🌿', wellnessHeroText:'Track the basics, celebrate your effort and remember to check in with yourself.',
      waterToday:'Water today', waterGoal:'A customizable visual target of 8 glasses, not a medical recommendation.',
      movementToday:'Movement today', movementHint:'Manually record minutes of movement that feel right to you.',
      sleepLast:'Hours slept', sleepHint:'A personal log of your most recent sleep; no device connection.',
      mindful:'Mindful moments', mindfulHint:'Minutes spent relaxing or taking a peaceful break.',
      plus:'Add', minus:'Remove', save:'Save', saved:'Saved', wellnessNote:'These values are self-reported. This app does not diagnose, treat or replace professional medical care.',
      settingsTitle:'Make this space yours', settingsSub:'Your name, your language, your style — and full control of your personal data.',
      profile:'Your profile', displayName:'Display name', namePlaceholder:'What should we call you?',
      language:'Language', appearance:'Appearance', light:'Light', dark:'Dark', privacy:'Your data & privacy',
      privacyText:'Your notes, mood logs and images stay in local browser storage. This is not encrypted or synced. Other users of this browser may access this data. Clearing site data or switching devices can erase it.',
      export:'Export my data', import:'Import backup', exportHint:'Downloads a readable JSON file. Store it somewhere private.',
      importHint:'Import replaces your current data. Only import a backup you trust.',
      clearData:'Erase all local data', eraseConfirm:'Permanently erase all your data from this browser? Export a backup first if needed.',
      importConfirm:'Replace all current data with the selected backup?', doneImport:'Backup imported', importError:'This does not look like a My Health backup.',
      aiSettings:'Optional AI connection', aiSettingsText:'This GitHub Pages app uses a fully local recommendation engine by default. To enable generative AI, deploy the included serverless backend with your own API key, then paste its HTTPS URL below. Your key must stay on the server.',
      endpoint:'Private backend URL', endpointPlaceholder:'https://your-backend.vercel.app/api/plan',
      consent:'I agree to send my current mood, energy, time preference and favorite titles to this backend when I request an AI plan.',
      aiSave:'Save AI settings', aiDisabled:'AI endpoint not configured; your local planner is ready.',
      aiFail:'AI unavailable; made you an on-device plan instead.', aiReady:'AI suggestions received.',
      backupCreated:'Backup downloaded', dataCleared:'Local data erased', updated:'Settings updated',
      tips:'Tiny inspirations', appFooter:'Made to make your day a little brighter ✨', start:'Get started', cancel:'Cancel',
      close:'Close', yesDelete:'Yes, delete', savedFavorite:'Added to your favorites', savedIdea:'Your idea is safe here',
      savedMemory:'Memory added', savedPhoto:'Photo added', invalidPhoto:'Please choose a JPEG, PNG or WebP image (max 6 MB).',
      storageFull:'Browser storage is full. Export a backup or remove a large photo.',
      imageProcessing:'Preparing your photo…', file:'File', openMenu:'Open menu',
      days:'days', score:'Mood score', newPlan:'New plan', saveSettings:'Save profile',
      about:'About the app', aboutText:'An independent Apple Health-inspired concept, not affiliated with Apple. All dashboard tracking is manual.',
      viewMood:'View mood log', affirm:'Your pace is your own.', entriesEmpty:'Nothing saved yet.',
      meal:'Make a favorite snack', musicBreak:'Your own soundtrack', peaceful:'A little reset', creativity:'Make something',
      personalNote:'This is a journaling and lifestyle app, not an emergency or clinical service.'
    },
    fa: {
      app:'سلامتی من', home:'داشبورد', mood:'ثبت احساسات', planner:'برنامه‌ریز شادی', joy:'علاقه‌مندی‌ها',
      journal:'ایده‌ها و یادداشت‌ها', memories:'خاطرات و عکس‌ها', wellness:'سلامت روزانه', settings:'تنظیمات',
      main:'فضای من', collections:'زندگی من', more:'بیشتر', today:'امروز', private:'خصوصی، فقط برای تو',
      heroTitle:'برای <span>شادی بیشتر</span> جا باز کن.', heroText:'یک فضای دوست‌داشتنی برای سلامتی، احساسات، علاقه‌ها و تمام چیزهای کوچکی که زندگی‌ات را می‌سازند.',
      getInspired:'برای امروز برنامه بچین', dashboardTitle:'گوشه‌ی حالِ خوب تو', dashboardSub:'قدم‌های کوچک، پیشرفت‌های قشنگ. خوش اومدی!',
      quickMood:'الان چه احساسی داری؟', quickMoodSub:'هر احساسی اینجا جاش امنه. یک لحظه حال خودت رو بپرس.',
      moodNote:'دلت می‌خواد بیشتر بگی؟', moodPlaceholder:'امروزت چطور گذشت؟ (اختیاری)', saveMood:'ثبت احساس من',
      moodSaved:'احساست ثبت شد', lastSeven:'۷ روز گذشته', lastSevenSub:'آخرین حال‌وهوای ثبت‌شده هر روز؛ روزهای خالی یعنی چیزی ثبت نکردی.',
      feelingGreat:'عالی', feelingGood:'خوب', feelingOkay:'معمولی', feelingLow:'دلگیر', feelingAnxious:'مضطرب', feelingTired:'خسته',
      checkinCount:'ثبت احساس', happyMoments:'علاقه‌مندی', savedIdeas:'ایده‌های ثبت‌شده', checkIn:'ثبت حال‌وهوا',
      water:'آب', movement:'تحرک', sleep:'خواب', glasses:'لیوان', minutes:'دقیقه', hours:'ساعت',
      joys:'چیزهایی که دوست داری', joysSub:'کلکسیون شخصی چیزهای حال‌خوب‌کن رو کنارت نگه دار.',
      addFavorite:'افزودن علاقه', viewAll:'نمایش همه', favoriteEmpty:'کلکسیونت منتظرته!',
      favoriteEmptyText:'بازی‌ها، آهنگ‌ها، فیلم‌ها، جاها و هر چیزی رو که باعث لبخندت می‌شه ثبت کن.',
      dailyInspiration:'یک یادآوری کوچک', quote:'حق داری از چیزهای کوچک زندگی لذت ببری.', quoteBy:'یک یادداشت برای خودت',
      joyIdea:'یک پیشنهاد برای تو', joyIdeaText:'علاقه‌مندی‌هات رو به سرگرمی‌های کوچیک متناسب با امروزت تبدیل کن.',
      moodTitle:'احساساتت مهمن', moodSub:'بدون قضاوت به حال‌وهوات توجه کن و الگوهای شخصی خودت رو ببین.',
      moodHistory:'تاریخچه‌ی احساسات', historyEmpty:'ماجرات از اینجا شروع می‌شه', historyEmptyText:'اولین احساست رو ثبت کن تا به‌مرور تغییراتش رو ببینی.',
      entry:'مورد', entries:'مورد', noNotes:'بدون توضیح', delete:'حذف', deleteConfirm:'این مورد حذف بشه؟',
      latestMood:'آخرین احساس', noMood:'هنوز چیزی ثبت نکردی', dailyTip:'قرار نیست هر روز خوشحال باشی. اینجا برای تمام احساساتت جا هست.',
      plannerTitle:'روز تو، شادی به سبک تو', plannerSub:'پیشنهاد سرگرمی بر اساس حال‌وهوا، انرژی و چیزهایی که دوست داری.',
      plannerBanner:'شادی هر روز می‌تونه شکل تازه‌ای داشته باشه ✨', plannerBannerText:'بگو چقدر وقت و انرژی داری. برنامه‌ریز روی دستگاه، بر اساس علایقت چند ایده‌ی آروم، سرگرم‌کننده یا خلاقانه می‌ده.',
      timeAvailable:'زمان آزاد', energy:'میزان انرژی', gentle:'کم', balanced:'متوسط', adventurous:'زیاد',
      planNow:'برنامه‌ام رو بساز', todaysPlan:'برنامه‌ی مخصوص تو', regenerate:'ایده‌های تازه', emptyPlan:'هنوز برنامه‌ای نساختی',
      emptyPlanText:'زمان و میزان انرژی‌ات رو انتخاب کن و یک برنامه مخصوص خودت بساز.',
      plannerPrivate:'این پیشنهادهای هوشمند روی دستگاه خودت ساخته می‌شن و نیازی به حساب کاربری ندارن.',
      plannerAI:'برای هوش مصنوعی مولد، باید سرویس خصوصی اختیاری رو در تنظیمات وصل کنی.',
      plannedFor:'برنامه برای', done:'انجام شد', offline:'پیشنهاد هوشمند آفلاین', cloud:'پیشنهاد هوش مصنوعی',
      joyTitle:'چیزهایی که عاشقشونی', joySub:'کتابخانه‌ی حال‌خوب‌کن مخصوص خودت: بازی، فیلم، انیمیشن، موزیک و کلی چیز دیگه.',
      searchFavorite:'جست‌وجو در علاقه‌مندی‌ها...', all:'همه', games:'بازی', movies:'فیلم', anime:'انیمیشن', music:'موزیک', books:'کتاب',
      travel:'سفر', hobbies:'سرگرمی', people:'آدم‌ها و حیوانات', others:'سایر', addThing:'یک علاقه‌ی تازه',
      favoriteName:'اسمش چیه؟', favoriteNotes:'چرا دوستش داری؟', category:'دسته‌بندی',
      emoji:'ایموجی (اختیاری)', add:'افزودن به کلکسیون', required:'لطفاً یک عنوان وارد کن.',
      journalTitle:'هر ایده یک جرقه‌ی کوچیکه', journalSub:'فکرها، اختراع‌ها، قصه‌ها و حال‌وهوای روزمره رو اینجا ثبت کن.',
      newIdea:'ایده جدید', ideas:'ایده‌های تو', journalEmpty:'کلی صفحه‌ی سفید و کلی احتمال',
      journalEmptyText:'ایده‌ی یک بازی، یک اختراع عجیب یا فکری که نمی‌خوای فراموشش کنی رو بنویس.',
      ideaTitle:'یک اسم برای ایده‌ات', ideaContent:'ایده‌ات رو تعریف کن...', ideaType:'نوع',
      creative:'خلاقانه', personal:'شخصی', project:'پروژه', reflection:'یادداشت روزانه',
      saveIdea:'ثبت ایده', journalHint:'یک فکر کوچیک امروز شاید فردا به چیز بزرگی تبدیل بشه.',
      memoriesTitle:'لحظات قشنگت رو نگه دار', memoriesSub:'خاطرات سفر، روزهای خاص و عکس‌هایی که ارزش نگه‌داشتن دارن.',
      photos:'عکس‌ها', addMemory:'ثبت خاطره', addPhoto:'افزودن عکس', memoriesEmpty:'داستانت تازه شروع شده',
      memoriesEmptyText:'از یک سفر، یک روز خوب یا یک لحظه فراموش‌نشدنی بنویس.',
      memoryTitle:'اسم این خاطره چیه؟', memoryContent:'چی شد؟ با کی بودی؟ چه حسی داشتی؟',
      memoryDate:'تاریخ', saveMemory:'ثبت خاطره', photoTitle:'یک اسم برای این عکس', photoFile:'انتخاب عکس',
      photoHint:'عکس‌ها فشرده و در مرورگر ذخیره می‌شن. عکس‌های زیاد ممکنه حافظه مرورگر رو پر کنن.',
      photoEmpty:'هنوز عکسی نیست', photoEmptyText:'عکس‌های محبوبت رو اضافه کن و کنار هم نگهشون دار.',
      wellnessTitle:'به روش خودت مراقب باش', wellnessSub:'ثبت دستی چند عادت ساده‌ی روزانه؛ نه اندازه‌گیری پزشکی.',
      wellnessHeroTitle:'عادت‌های کوچیک، روزهای قشنگ 🌿', wellnessHeroText:'چند عادت ساده رو دنبال کن، تلاشت رو ببین و یادت باشه از خودت خبر بگیری.',
      waterToday:'آب امروز', waterGoal:'هدف نمایشی قابل تغییر ۸ لیوان؛ توصیه پزشکی نیست.',
      movementToday:'تحرک امروز', movementHint:'دقایق فعالیت مناسب خودت رو به‌صورت دستی ثبت کن.',
      sleepLast:'ساعت خواب', sleepHint:'ثبت شخصی مدت خواب اخیر؛ بدون اتصال به دستگاه.',
      mindful:'آرامش', mindfulHint:'دقایقی که برای استراحت یا آرامش کنار گذاشتی.',
      plus:'اضافه', minus:'کم کردن', save:'ذخیره', saved:'ذخیره شد', wellnessNote:'این اعداد خوداظهاری هستن. این برنامه تشخیص یا درمان پزشکی ارائه نمی‌ده.',
      settingsTitle:'اینجا رو مال خودت کن', settingsSub:'اسم، زبان و رنگ‌بندی دلخواهت؛ با کنترل کامل روی داده‌های شخصی.',
      profile:'پروفایل تو', displayName:'نام نمایشی', namePlaceholder:'چی صدات کنیم؟',
      language:'زبان', appearance:'ظاهر', light:'روشن', dark:'تاریک', privacy:'داده‌ها و حریم خصوصی',
      privacyText:'یادداشت‌ها، احساسات و عکس‌هات فقط در حافظه همین مرورگر می‌مونن؛ رمزگذاری یا همگام‌سازی نمی‌شن. هر کسی که به این مرورگر دسترسی داشته باشه ممکنه داده‌ها رو ببینه. پاک‌کردن داده‌های سایت یا عوض‌کردن دستگاه می‌تونه اطلاعات رو از بین ببره.',
      export:'خروجی از اطلاعاتم', import:'بازیابی پشتیبان', exportHint:'یک فایل JSON قابل‌خواندن دانلود می‌شه؛ در جای امن نگهداری کن.',
      importHint:'بازیابی، تمام اطلاعات فعلی رو جایگزین می‌کنه. فقط فایل مطمئن وارد کن.',
      clearData:'پاک‌کردن همه داده‌ها', eraseConfirm:'همه اطلاعات این مرورگر برای همیشه پاک بشن؟ در صورت نیاز اول پشتیبان بگیر.',
      importConfirm:'اطلاعات فعلی با فایل پشتیبان جایگزین بشن؟', doneImport:'اطلاعات بازیابی شد', importError:'این فایل پشتیبان معتبر برنامه نیست.',
      aiSettings:'اتصال اختیاری هوش مصنوعی', aiSettingsText:'نسخه گیت‌هاب پیجز به‌صورت پیش‌فرض از پیشنهادهای کاملاً محلی استفاده می‌کنه. برای هوش مصنوعی مولد، بک‌اند آماده پروژه رو با کلید API سمت سرور راه‌اندازی کن و نشانی HTTPS اون رو اینجا وارد کن.',
      endpoint:'نشانی بک‌اند خصوصی', endpointPlaceholder:'https://your-backend.vercel.app/api/plan',
      consent:'موافقم موقع درخواست برنامه‌ی AI، فقط حال‌وهوای فعلی، انرژی، زمان آزاد و اسم علاقه‌مندی‌هام برای این سرویس فرستاده بشن.',
      aiSave:'ذخیره تنظیمات AI', aiDisabled:'سرویس AI وصل نیست؛ برنامه‌ریز محلی آماده است.',
      aiFail:'هوش مصنوعی در دسترس نبود؛ برنامه‌ی محلی برات ساختم.', aiReady:'پیشنهادهای هوش مصنوعی دریافت شد.',
      backupCreated:'فایل پشتیبان دانلود شد', dataCleared:'اطلاعات محلی پاک شد', updated:'تنظیمات ذخیره شد',
      tips:'پیشنهادهای کوچک', appFooter:'برای روزهای قشنگ‌تر ✨', start:'شروع کن', cancel:'انصراف',
      close:'بستن', yesDelete:'بله، حذف کن', savedFavorite:'به علاقه‌مندی‌هات اضافه شد', savedIdea:'ایده‌ات ثبت شد',
      savedMemory:'خاطره ثبت شد', savedPhoto:'عکس اضافه شد', invalidPhoto:'یک تصویر JPEG یا PNG یا WebP تا حداکثر ۶ مگابایت انتخاب کن.',
      storageFull:'حافظه مرورگر پر شده. از اطلاعاتت پشتیبان بگیر یا عکس‌های بزرگ رو حذف کن.',
      imageProcessing:'در حال آماده‌سازی تصویر…', file:'فایل', openMenu:'بازکردن منو',
      days:'روز', score:'امتیاز حال‌وهوا', newPlan:'برنامه جدید', saveSettings:'ذخیره پروفایل',
      about:'درباره برنامه', aboutText:'یک نمونه مستقل با الهام از Apple Health؛ وابسته به اپل نیست. تمام اطلاعات داشبورد دستی ثبت می‌شن.',
      viewMood:'نمایش تاریخچه', affirm:'با سرعت خودت جلو برو.', entriesEmpty:'هنوز چیزی ذخیره نشده.',
      meal:'میان‌وعده موردعلاقه', musicBreak:'موسیقی مخصوص خودت', peaceful:'یک استراحت کوچک', creativity:'چیزی بساز',
      personalNote:'این برنامه برای سبک زندگی و یادداشت‌های شخصی است، نه خدمات اورژانسی یا بالینی.'
    }
  };
  const t = key => (tData[state.lang] && tData[state.lang][key]) || tData.en[key] || key;
  const MOODS = [
    {score:5, emoji:'🤩', key:'feelingGreat', tint:'#e0fbef'},
    {score:4, emoji:'😊', key:'feelingGood', tint:'#e5f7f3'},
    {score:3, emoji:'🙂', key:'feelingOkay', tint:'#fff5e6'},
    {score:2, emoji:'😔', key:'feelingLow', tint:'#ffedf1'},
    {score:1, emoji:'😟', key:'feelingAnxious', tint:'#eeeaff'},
    {score:0, emoji:'😴', key:'feelingTired', tint:'#edf2ff'}
  ];
  const TYPES = [
    {id:'games', icon:'🎮'}, {id:'movies', icon:'🎬'}, {id:'anime',icon:'🦊'},
    {id:'music',icon:'🎧'}, {id:'books',icon:'📚'}, {id:'travel',icon:'🌎'},
    {id:'hobbies',icon:'🎨'}, {id:'people',icon:'🐈'}, {id:'others',icon:'💖'}
  ];
  const NAV = [
    {id:'home',icon:'home',group:0},{id:'mood',icon:'heart',group:0},
    {id:'planner',icon:'sparkle',group:0},{id:'wellness',icon:'activity',group:0},
    {id:'joy',icon:'star',group:1},{id:'journal',icon:'notebook',group:1},
    {id:'memories',icon:'image',group:1},{id:'settings',icon:'settings',group:1}
  ];
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    sparkle:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9zM20 18l.7 1.3L22 20l-1.3.7L20 22l-.7-1.3L18 20l1.3-.7z"/>',
    activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    star:'<path d="m12 2 3.1 6.7 7.4.9-5.4 5.2 1.3 7.3-6.4-3.5-6.4 3.5 1.3-7.3-5.4-5.2 7.4-.9z"/>',
    notebook:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18M12 8h5M12 12h5"/>',
    image:'<rect x="2.5" y="3" width="19" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 6"/>',
    settings:'<path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z"/><path d="M19.4 13.5a1.5 1.5 0 0 0 .3 1.6l.1.1-1.9 3.2-.2-.1a1.5 1.5 0 0 0-1.6.2l-.8.5a1.5 1.5 0 0 0-.7 1.5v.2H9.4v-.2a1.5 1.5 0 0 0-.7-1.5l-.8-.5a1.5 1.5 0 0 0-1.6-.2l-.2.1-1.9-3.2.1-.1a1.5 1.5 0 0 0 .3-1.6v-1a1.5 1.5 0 0 0-.3-1.6l-.1-.1 1.9-3.2.2.1a1.5 1.5 0 0 0 1.6-.2l.8-.5a1.5 1.5 0 0 0 .7-1.5v-.2h5.2v.2a1.5 1.5 0 0 0 .7 1.5l.8.5a1.5 1.5 0 0 0 1.6.2l.2-.1 1.9 3.2-.1.1a1.5 1.5 0 0 0-.3 1.6z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>', trash:'<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    moon:'<path d="M20 15.1A8.2 8.2 0 0 1 8.9 4 8.5 8.5 0 1 0 20 15.1z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    upload:'<path d="M12 17V5m-5 5 5-5 5 5M4 17v4h16v-4"/>',
    check:'<path d="m4 12 5 5L20 6"/>', menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-2l1 5M4 12a8 8 0 0 0 15 3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield:'<path d="m12 2 8 4v5c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V6z"/><path d="m9 12 2 2 4-4"/>'
  };
  const ico = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { toast(t('storageFull')); return false; }
  }
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3400);
  }
  const dateText = (date, options = {month:'short',day:'numeric'}) => {
    try { return new Intl.DateTimeFormat(state.lang === 'fa' ? 'fa-IR' : 'en-US', options).format(new Date(date)); }
    catch { return String(date).slice(0, 10); }
  };
  const moodByScore = score => MOODS.find(m => m.score === Number(score)) || MOODS[2];
  const latestMood = () => [...state.moods].sort((a,b) => Date.parse(b.time)-Date.parse(a.time))[0];
  const cleanList = (list) => [...list].filter(Boolean).sort((a,b) => Date.parse(b.time || b.date || 0)-Date.parse(a.time || a.date || 0));
  const currentWellness = () => {
    const entry = state.wellness[today()] || {};
    return {water: Number(entry.water)||0, movement:Number(entry.movement)||0, sleep:Number(entry.sleep)||0, mindful:Number(entry.mindful)||0};
  };
  const empty = (emoji,title,desc,buttonLabel,action) => `<div class="empty"><span class="empty-art">${emoji}</span><strong>${esc(title)}</strong><p>${esc(desc)}</p>${buttonLabel ? `<button class="btn btn-light btn-sm" data-action="${action}">${ico('plus',14)} ${esc(buttonLabel)}</button>` : ''}</div>`;
  function navItem(item) {
    return `<button type="button" data-nav="${item.id}" class="nav-item ${page === item.id?'active':''}" ${page === item.id?'aria-current="page"':''}>${ico(item.icon)}<span>${esc(t(item.id))}</span></button>`;
  }
  function renderChrome() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('dark',state.theme === 'dark');
    document.title = `${t(page)} · ${t('app')}`;
    $('#sidebar').innerHTML = `<a class="brand" href="#home"><span class="brand-mark">♥</span><span>My <em>Health</em></span></a>
      <div class="nav-group"><div class="nav-caption">${esc(t('main'))}</div>${NAV.filter(n=>n.group===0).map(navItem).join('')}</div>
      <div class="nav-group"><div class="nav-caption">${esc(t('collections'))}</div>${NAV.filter(n=>n.group===1).map(navItem).join('')}</div>
      <div class="sidebar-bottom"><div class="side-banner"><p>${state.lang==='fa'?'یک حال خوب کوچیک 🌸':'A little more joy 🌸'}</p><small>${esc(t('joyIdeaText'))}</small><button data-nav="planner">${esc(t('getInspired'))}</button></div>
      <div class="helper text-center">♥ &nbsp; ${esc(t('appFooter'))}</div></div>`;
    $('#topbar').innerHTML = `<div class="topbar-left"><div><span class="topbar-label">${esc(t('private'))}</span><h2 class="topbar-title">${esc(t(page))}</h2></div></div>
      <div class="topbar-actions"><span class="pill-date">${ico('calendar',14)} &nbsp;${esc(dateText(new Date(),{weekday:'short',month:'short',day:'numeric'}))}</span>
        <button class="icon-button" data-action="language" aria-label="${state.lang==='en'?'Switch to Persian':'Switch to English'}" title="${state.lang==='en'?'فارسی':'English'}"><b style="font-size:12px">${state.lang==='en'?'فا':'EN'}</b></button>
        <button class="icon-button" data-action="theme" aria-label="${esc(t('appearance'))}">${ico(state.theme==='light'?'moon':'sun')}</button>
        <button class="avatar" data-nav="settings" aria-label="${esc(t('settings'))}">${esc((state.name.trim()[0] || '♥').toUpperCase())}</button>
      </div>`;
    const mobile = ['home','mood','planner','joy'];
    $('#mobileNav').innerHTML = mobile.map(id => {
      const item = NAV.find(x=>x.id===id);
      return `<button data-nav="${id}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${ico(item.icon)}<span>${esc(t(id))}</span></button>`;
    }).join('') + `<button data-action="menu" class="${!mobile.includes(page)?'active':''}">${ico('menu')}<span>${esc(t('more'))}</span></button>`;
  }
  function pageHead(title,sub,action = '') {
    return `<div class="page-head"><div><span class="eyebrow">MY HEALTH ✦</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>${action}</div>`;
  }
  function moodPicker() {
    return `<div class="mood-picker" role="group" aria-label="${esc(t('quickMood'))}">${MOODS.map(m =>
      `<button type="button" data-mood="${m.score}" aria-pressed="${selectedMood===m.score}" class="mood-option ${selectedMood===m.score?'selected':''}"><span class="face">${m.emoji}</span><small>${esc(t(m.key))}</small></button>`).join('')}</div>`;
  }
  function moodForm() {
    return `<form id="moodForm" class="stack"><div>${moodPicker()}</div><div class="field"><label for="moodNote">${esc(t('moodNote'))}</label><textarea id="moodNote" class="textarea" maxlength="1200" placeholder="${esc(t('moodPlaceholder'))}"></textarea></div><div class="card-actions"><span class="helper">${esc(t('dailyTip'))}</span><button type="submit" class="btn btn-primary" ${selectedMood===null?'disabled':''}>${ico('heart',15)} ${esc(t('saveMood'))}</button></div></form>`;
  }
  function weeklyMoodChart() {
    const days = Array.from({length:7},(_,i)=>{const d = new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);return d;});
    return `<div class="week-chart" role="img" aria-label="${esc(t('lastSeven'))}">${days.map((d,i) => {
      const key = todayKey(d), item = cleanList(state.moods.filter(x=>todayKey(new Date(x.time))===key))[0];
      const m = item ? moodByScore(item.score) : null;
      const pct = m ? 25 + m.score*13 : 0;
      return `<div class="week-day ${i===6?'today':''}" title="${esc(dateText(d))}: ${m?esc(t(m.key)):'—'}"><div class="week-bar-track">${m?`<div class="week-emoji">${m.emoji}</div>`:''}<div class="week-bar ${!m?'empty':''}" style="height:${pct}%"></div></div><small>${esc(dateText(d,{weekday:'short'}))}</small></div>`;
    }).join('')}</div>`;
  }
  function todayKey(d) {
    if (!(d instanceof Date) || isNaN(d)) return '';
    return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  }
  function metric(type, label, count, unit, iconSymbol) {
    return `<div class="metric ${type}"><div class="metric-top"><span class="metric-label">${esc(label)}</span><span class="metric-icon">${iconSymbol}</span></div><strong>${esc(count)}</strong> ${unit?`<small>${esc(unit)}</small>`:''}<div class="metric-foot">${esc(t('affirm'))}</div></div>`;
  }
  function renderHome() {
    const wellness = currentWellness(), m = latestMood(), greet = state.name ? `${state.lang==='fa'?'سلام':'Hi'}, ${esc(trunc(state.name,25))}!` : (state.lang==='fa'?'سلام! امروزت قشنگ 🌷':'Hello, lovely human! 🌷');
    return `<div class="bento">
      <section class="hero span-12"><div class="hero-copy"><div class="tiny-badge">✦ ${esc(t('private'))}</div><h1>${t('heroTitle')}</h1><p>${esc(t('heroText'))}</p><button class="btn btn-primary" data-nav="planner">${ico('sparkle',17)} ${esc(t('getInspired'))}</button></div>
      <div class="hero-art" aria-hidden="true"><span class="sparkle s1">✧</span><div class="hero-orb">♥</div><span class="sparkle s2">✦</span></div></section>
      <section class="span-12"><div class="page-head" style="margin:9px 0 0"><div><h1 style="font-size:23px">${greet}</h1><p>${esc(t('dashboardSub'))}</p></div></div>
      <div class="metric-grid" style="margin-top:17px">${metric('pink',t('checkinCount'),state.moods.length,'','💗')}${metric('mint',t('happyMoments'),state.favorites.length,'','✨')}${metric('blue',t('savedIdeas'),state.ideas.length,'','💡')}</div></section>
      <section class="card span-7"><div class="card-head"><div><h2 class="card-title">${ico('heart')} ${esc(t('quickMood'))}</h2><p class="card-subtitle">${esc(t('quickMoodSub'))}</p></div></div>${moodForm()}</section>
      <section class="card span-5"><div class="card-head"><div><h2 class="card-title">${ico('activity')} ${esc(t('lastSeven'))}</h2><p class="card-subtitle">${esc(t('lastSevenSub'))}</p></div><button class="subtle-link" data-nav="mood">${esc(t('viewAll'))}</button></div>${weeklyMoodChart()}</section>
      <section class="card span-8"><div class="card-head"><div><h2 class="card-title">${ico('star')} ${esc(t('joys'))}</h2><p class="card-subtitle">${esc(t('joysSub'))}</p></div><button class="subtle-link" data-nav="joy">${esc(t('viewAll'))} →</button></div>
      ${state.favorites.length?`<div class="joy-tags">${state.favorites.slice(-8).reverse().map(f=>`<button class="joy-tag" data-nav="joy"><b>${esc(f.emoji||typeIcon(f.type))}</b> ${esc(trunc(f.name,24))}</button>`).join('')}</div><div style="margin-top:18px"><button class="btn btn-light btn-sm" data-action="favorite">${ico('plus',14)} ${esc(t('addFavorite'))}</button></div>`:empty('🎮',t('favoriteEmpty'),t('favoriteEmptyText'),t('addFavorite'),'favorite')}</section>
      <section class="card quote-card span-4"><div class="quote-symbol">❝</div><blockquote>${esc(t('quote'))}</blockquote><small>♥ ${esc(t('quoteBy'))}</small></section>
      <section class="card prompt-card span-6"><span class="prompt-icon">🎨</span><h3>${esc(t('joyIdea'))}</h3><p>${esc(t('joyIdeaText'))}</p><button class="btn btn-white btn-sm" data-nav="planner">${esc(t('getInspired'))} ${ico('arrow',14)}</button></section>
      <section class="card span-6"><div class="card-head"><h2 class="card-title">${ico('activity')} ${esc(t('today'))}</h2><button class="subtle-link" data-nav="wellness">${esc(t('viewAll'))} →</button></div>
        <div class="flex-between"><span class="helper">💧 ${esc(t('water'))}</span><strong>${wellness.water} ${esc(t('glasses'))}</strong></div><div class="goal-line"><i style="width:${Math.min(wellness.water / 8 * 100,100)}%"></i></div>
        <div class="flex-between mt-20"><span class="helper">🚶 ${esc(t('movement'))}</span><strong>${wellness.movement} ${esc(t('minutes'))}</strong></div><div class="separator"></div>
        <div class="flex-between"><span class="helper">${esc(t('latestMood'))}</span><strong>${m?`${moodByScore(m.score).emoji} ${esc(t(moodByScore(m.score).key))}`:esc(t('noMood'))}</strong></div>
      </section></div>`;
  }
  function renderMood() {
    const recent = cleanList(state.moods);
    return `${pageHead(t('moodTitle'),t('moodSub'),`<button class="btn btn-primary" data-nav="home">${ico('heart')} ${esc(t('checkIn'))}</button>`)}
      <div class="bento"><section class="card span-7"><div class="card-head"><h2 class="card-title">${ico('heart')} ${esc(t('quickMood'))}</h2></div>${moodForm()}</section>
      <section class="card span-5"><div class="card-head"><div><h2 class="card-title">${ico('activity')} ${esc(t('lastSeven'))}</h2><p class="card-subtitle">${esc(t('lastSevenSub'))}</p></div></div>${weeklyMoodChart()}<div class="notice mt-20">${esc(t('dailyTip'))}</div></section>
      <section class="card span-12"><div class="card-head"><h2 class="card-title">${ico('notebook')} ${esc(t('moodHistory'))}</h2><span class="micro-label">${recent.length} ${esc(t('entries'))}</span></div>
      ${recent.length ? `<div class="feed-list">${recent.map(e=>{
        const m = moodByScore(e.score);
        return `<article class="feed-item"><span class="feed-emoji" style="background:${m.tint}">${m.emoji}</span><div class="feed-body"><strong>${esc(t(m.key))}</strong><div class="feed-meta">${esc(dateText(e.time,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}))}</div>${e.note?`<p>${esc(e.note)}</p>`:''}</div><button class="delete-mini" data-delete="moods" data-id="${esc(e.id)}" aria-label="${esc(t('delete'))}">${ico('trash',14)}</button></article>`;
      }).join('')}</div>`:empty('💗',t('historyEmpty'),t('historyEmptyText'))}</section></div>`;
  }
  function typeIcon(type) {return TYPES.find(x=>x.id===type)?.icon || '💖';}
  function typeName(type) {return t(TYPES.some(x=>x.id===type)?type:'others');}
  function joyGrid() {
    const arr = cleanList(state.favorites).filter(f => (joyCategory==='all'||f.type===joyCategory)&&`${f.name||''} ${f.notes||''}`.toLocaleLowerCase().includes(joySearch.toLocaleLowerCase()));
    if (!arr.length) return empty('🌈',t('favoriteEmpty'),t('favoriteEmptyText'),t('addFavorite'),'favorite');
    return `<div class="collection-grid">${arr.map(f => `<article class="collection-card"><div class="collection-thumb" style="background:${f.type==='music'?'linear-gradient(130deg,#e8e5ff,#d9f7fe)':f.type==='games'?'linear-gradient(130deg,#e2f8ff,#e8e3ff)':'linear-gradient(130deg,#ffe7ea,#f2e8ff)'}">${esc(f.emoji||typeIcon(f.type))}</div>
      <div><h3>${esc(f.name)}</h3>${f.notes?`<p>${esc(trunc(f.notes,240))}</p>`:''}</div><footer><span class="micro-label">${esc(typeName(f.type))}</span><button class="delete-mini" data-delete="favorites" data-id="${esc(f.id)}" aria-label="${esc(t('delete'))}">${ico('trash',14)}</button></footer></article>`).join('')}</div>`;
  }
  function renderJoy() {
    return `${pageHead(t('joyTitle'),t('joySub'),`<button class="btn btn-primary" data-action="favorite">${ico('plus')} ${esc(t('addFavorite'))}</button>`)}
      <div class="filter-row"><div class="searchbox">${ico('search')}<input id="joySearch" class="input" maxlength="200" placeholder="${esc(t('searchFavorite'))}" value="${esc(joySearch)}" aria-label="${esc(t('searchFavorite'))}"></div>
      <span class="helper">${state.favorites.length} ${esc(t('entries'))}</span></div>
      <div class="flex-wrap" id="joyFilters" style="margin-bottom:23px">${[{id:'all',icon:'🌈'},...TYPES].map(x=>`<button class="chip ${joyCategory===x.id?'selected':''}" data-filter="${x.id}"><span class="chip-emoji">${x.icon}</span>${esc(t(x.id))}</button>`).join('')}</div>
      <div id="joyGrid">${joyGrid()}</div>`;
  }
  function renderJournal() {
    const ideas = cleanList(state.ideas);
    return `${pageHead(t('journalTitle'),t('journalSub'),`<button class="btn btn-primary" data-action="idea">${ico('plus')} ${esc(t('newIdea'))}</button>`)}
      <div class="bento"><section class="card prompt-card span-4"><span class="prompt-icon">💡</span><h3>${esc(t('journalHint'))}</h3><p>${esc(t('journalSub'))}</p><button data-action="idea" class="btn btn-white btn-sm">${ico('plus',14)} ${esc(t('newIdea'))}</button></section>
      <section class="card span-8"><div class="card-head"><h2 class="card-title">${ico('notebook')} ${esc(t('ideas'))}</h2><span class="micro-label">${ideas.length} ${esc(t('entries'))}</span></div>
      ${ideas.length ? `<div class="feed-list">${ideas.map(idea=>`<article class="note-card"><span class="note-emoji">${idea.kind==='project'?'🚀':idea.kind==='personal'?'🌷':idea.kind==='reflection'?'📝':'💡'}</span><h3>${esc(idea.title)}</h3><p>${esc(idea.content)}</p><footer><span class="micro-label">${esc(t(idea.kind||'creative'))} · ${esc(dateText(idea.time))}</span><button class="delete-mini" data-delete="ideas" data-id="${esc(idea.id)}" aria-label="${esc(t('delete'))}">${ico('trash',14)}</button></footer></article>`).join('')}</div>`:empty('💡',t('journalEmpty'),t('journalEmptyText'),t('newIdea'),'idea')}</section></div>`;
  }
  function renderMemories() {
    const memories = cleanList(state.memories), photos = cleanList(state.photos);
    return `${pageHead(t('memoriesTitle'),t('memoriesSub'),`<button class="btn btn-primary" data-action="${activeMemoryTab==='photos'?'photo':'memory'}">${ico('plus')} ${esc(t(activeMemoryTab==='photos'?'addPhoto':'addMemory'))}</button>`)}
      <div class="flex-wrap" style="margin-bottom:18px"><button class="chip ${activeMemoryTab==='memories'?'selected':''}" data-tab="memories">🧳 ${esc(t('memories'))} <span class="micro-label">${memories.length}</span></button><button class="chip ${activeMemoryTab==='photos'?'selected':''}" data-tab="photos">📷 ${esc(t('photos'))} <span class="micro-label">${photos.length}</span></button></div>
      ${activeMemoryTab==='photos' ? `<div class="notice" style="margin-bottom:16px">${esc(t('photoHint'))}</div>${photos.length?`<div class="photo-grid">${photos.map(p=>`<article class="photo-card"><img src="${validImage(p.src)?p.src:''}" loading="lazy" alt="${esc(p.title)}"><h3>${esc(p.title)}</h3><div class="flex-between"><small>${esc(dateText(p.time))}</small><button class="delete-mini" data-delete="photos" data-id="${esc(p.id)}" aria-label="${esc(t('delete'))}">${ico('trash',14)}</button></div></article>`).join('')}</div>`:empty('📷',t('photoEmpty'),t('photoEmptyText'),t('addPhoto'),'photo')}` :
      `${memories.length?`<div class="timeline">${memories.map(m=>`<article class="note-card"><span class="note-emoji">${esc(m.emoji||'🌻')}</span><h3>${esc(m.title)}</h3><p>${esc(m.content)}</p><footer><span class="micro-label">📅 ${esc(dateText(m.date||m.time,{year:'numeric',month:'long',day:'numeric'}))}</span><button class="delete-mini" data-delete="memories" data-id="${esc(m.id)}" aria-label="${esc(t('delete'))}">${ico('trash',14)}</button></footer></article>`).join('')}</div>`:empty('🧳',t('memoriesEmpty'),t('memoriesEmptyText'),t('addMemory'),'memory')}`}`;
  }
  function renderWellness() {
    const w = currentWellness();
    return `${pageHead(t('wellnessTitle'),t('wellnessSub'))}
      <section class="card wellness-hero" style="margin-bottom:19px"><h2 style="margin:0 0 8px;font-size:23px">${esc(t('wellnessHeroTitle'))}</h2><p class="helper" style="max-width:520px">${esc(t('wellnessHeroText'))}</p></section>
      <div class="bento">
        <section class="card span-6"><div class="card-head"><h2 class="card-title">💧 ${esc(t('waterToday'))}</h2><span class="micro-label">${esc(t('today'))}</span></div><div class="stat-large">${w.water} <span>${esc(t('glasses'))}</span></div>
          <div class="goal-line"><i style="width:${Math.min(100,w.water/8*100)}%"></i></div><div class="water-row">${Array.from({length:8},(_,i)=>`<button type="button" class="water-glass ${i<w.water?'filled':''}" data-water-set="${i+1}" aria-label="${i+1} ${esc(t('glasses'))}">💧</button>`).join('')}</div>
          <div class="flex-between"><span class="helper">${esc(t('waterGoal'))}</span><div class="number-stepper"><button data-wellness="water:-1" aria-label="${esc(t('minus'))}">−</button><button data-wellness="water:1" aria-label="${esc(t('plus'))}">+</button></div></div></section>
        ${[['movement','🏃','movementToday','movementHint',15,300],['sleep','🌙','sleepLast','sleepHint',.5,24],['mindful','🧘','mindful','mindfulHint',5,180]].map(([key,emoji,label,hint,step,max]) => `<section class="card span-6"><div class="card-head"><h2 class="card-title">${emoji} ${esc(t(label))}</h2></div><div class="stat-large">${w[key]} <span>${esc(t(key==='sleep'?'hours':'minutes'))}</span></div>
          <p class="helper">${esc(t(hint))}</p><div class="number-stepper mt-20"><button data-wellness="${key}:-${step}" aria-label="${esc(t('minus'))}">−</button><button data-wellness="${key}:${step}" aria-label="${esc(t('plus'))}">+</button></div></section>`).join('')}
        <div class="span-12 notice">${ico('shield',16)} &nbsp; ${esc(t('wellnessNote'))}</div>
      </div>`;
  }
  function planFallback() {
    const entries = state.favorites.slice().sort(()=>Math.random()-.5).slice(0,7);
    const latest = latestMood(), score = latest ? latest.score : 3;
    const calm = score<=2 || plannerEnergy==='low';
    const minutes = plannerDuration;
    const typePick = type => entries.find(f=>f.type===type);
    const music = typePick('music'), game = typePick('games'), film = typePick('movies') || typePick('anime');
    const book = typePick('books'), travel = typePick('travel'), hobby = typePick('hobbies');
    const label = (en,fa) => state.lang==='fa'?fa:en;
    const slots = [];
    const add = (emoji,title,desc,duration)=>slots.push({id:uid(),emoji,title,desc,duration,done:false});
    add('🌿',label('Start with a little reset','با یک استراحت کوچیک شروع کن'),label('Find a comfortable spot. Take a few relaxed breaths and notice what would feel good today.','یک جای راحت پیدا کن. چند نفس آروم بکش و ببین امروز دوست داری چی کار کنی.'),Math.min(10,Math.max(5,Math.floor(minutes*.14))));
    if (music) add('🎧',label(`Listen to ${music.name}`,`به ${music.name} گوش بده`),label('Put on a favorite track and give yourself a music break.','آهنگ محبوبت رو پخش کن و چند دقیقه فقط از موزیک لذت ببر.'),Math.min(20,Math.max(8,Math.floor(minutes*.25))));
    else add('🎵',label('Build your happy soundtrack','پلی‌لیست مخصوص امروزت بساز'),label('Pick three songs that match the energy you want right now.','سه آهنگ انتخاب کن که به حال‌وهوای الان تو می‌خورن.'),Math.min(15,Math.max(5,Math.floor(minutes*.20))));
    const fav = calm ? (book || film || game || hobby || travel) : (game || hobby || film || travel || book);
    if (fav) {
      const titles = {games:[`Enjoy ${fav.name}`,`کمی ${fav.name} بازی کن`],movies:[`Watch some of ${fav.name}`,`کمی ${fav.name} تماشا کن`],anime:[`Enjoy ${fav.name}`,`از تماشای ${fav.name} لذت ببر`],books:[`Read ${fav.name}`,`کمی ${fav.name} بخون`],travel:[`Revisit ${fav.name}`,`به خاطرات ${fav.name} سر بزن`],hobbies:[`Make time for ${fav.name}`,`برای ${fav.name} وقت بذار`]};
      const pair = titles[fav.type] || [`Enjoy ${fav.name}`,`از ${fav.name} لذت ببر`];
      add(typeIcon(fav.type),label(...pair),label('Spend some no-pressure time with something you already love.','بدون هیچ فشاری برای یکی از علاقه‌مندی‌هات وقت بذار.'),Math.max(10,Math.floor(minutes*.42)));
    } else add(calm?'📚':'🎮',calm?label('Cozy screen or book time','فیلم یا کتاب با یک جای دنج'):label('Try a playful mini-adventure','یک سرگرمی جدید امتحان کن'),calm?label('Choose a light film, a short animation or a comforting chapter.','یک فیلم سبک، انیمیشن کوتاه یا چند صفحه کتاب انتخاب کن.'):label('Try a short game, explore a new creative tool or make a tiny drawing.','یک بازی کوتاه، یک ابزار خلاقانه تازه یا یک نقاشی کوچیک رو امتحان کن.'),Math.max(10,Math.floor(minutes*.42)));
    if (minutes>=45) add(calm?'☕':'🎨',calm?label('Make your space cozy','به محیطت حال‌وهوای خوب بده'):label('Create a tiny something','یک چیز کوچیک خلق کن'),calm?label('Make a favorite drink, get comfy and take a slow break.','یک نوشیدنی دلخواه درست کن، راحت بشین و کمی استراحت کن.'):label('Write down a new idea, take a photograph or sketch a scene.','یک ایده تازه بنویس، یک عکس بگیر یا طرح کوچیکی بکش.'),Math.max(8,Math.floor(minutes*.18)));
    return {id:uid(),date:today(),createdAt:new Date().toISOString(),kind:'offline',slots};
  }
  function planDisplay(p) {
    return `<div class="card-head"><div><h2 class="card-title">${ico('sparkle')} ${esc(t('todaysPlan'))}</h2><p class="card-subtitle">${esc(t('plannedFor'))} ${esc(dateText(p.createdAt))} · ${esc(t(p.kind==='ai'?'cloud':'offline'))}</p></div><button data-action="generate-plan" class="btn btn-light btn-sm">${ico('refresh',14)} ${esc(t('regenerate'))}</button></div>
      <div class="stack">${p.slots.map((slot,i)=>`<div class="plan-slot"><span class="plan-icon">${esc(slot.emoji||'✨')}</span><div style="flex:1;min-width:0"><h3 style="${slot.done?'text-decoration:line-through;opacity:.55':''}">${esc(slot.title)}</h3><p>${esc(slot.desc)}</p><span class="plan-time">${ico('clock',12)} ${Number(slot.duration)||10} ${esc(t('minutes'))}</span></div><label class="plan-check"><input type="checkbox" data-plan-check="${esc(slot.id)}" ${slot.done?'checked':''} aria-label="${esc(t('done'))}"></label></div>`).join('')}</div>`;
  }
  function renderPlanner() {
    const p = state.plans.find(x=>x.date===today());
    return `${pageHead(t('plannerTitle'),t('plannerSub'))}
      <section class="planner-top"><span class="eyebrow">YOUR JOY PLANNER ✦</span><h2>${esc(t('plannerBanner'))}</h2><p>${esc(t('plannerBannerText'))}</p></section>
      <div class="bento mt-20"><section class="card span-4"><div class="stack"><div class="field"><label for="planDuration">${esc(t('timeAvailable'))}</label><select class="select" id="planDuration">${[30,60,90,120].map(n=>`<option value="${n}" ${plannerDuration===n?'selected':''}>${n} ${esc(t('minutes'))}</option>`).join('')}</select></div>
      <div class="field"><label>${esc(t('energy'))}</label><div class="inline-options">${[['low','🌙','gentle'],['medium','🌷','balanced'],['high','⚡','adventurous']].map(([v,e,label])=>`<button class="chip ${plannerEnergy===v?'selected':''}" data-energy="${v}">${e} ${esc(t(label))}</button>`).join('')}</div></div>
      <div class="separator"></div><div class="field"><label>${esc(t('latestMood'))}</label><div class="notice">${latestMood()?`${moodByScore(latestMood().score).emoji} ${esc(t(moodByScore(latestMood().score).key))}`:esc(t('noMood'))}</div></div>
      <button class="btn btn-primary" data-action="generate-plan">${ico('sparkle',17)} ${esc(t('planNow'))}</button>
      <p class="helper">${ico('shield',13)} ${esc(t('plannerPrivate'))}</p><p class="helper">${esc(t('plannerAI'))}</p></div></section>
      <section class="card span-8">${p?planDisplay(p):empty('🌈',t('emptyPlan'),t('emptyPlanText'))}</section></div>`;
  }
  function renderSettings() {
    return `${pageHead(t('settingsTitle'),t('settingsSub'))}<div class="card settings-card">
      <div class="settings-section" style="padding-top:0"><h3>${esc(t('profile'))}</h3><form id="profileForm" class="stack"><div class="field"><label for="profileName">${esc(t('displayName'))}</label><input class="input" maxlength="60" id="profileName" name="name" value="${esc(state.name)}" placeholder="${esc(t('namePlaceholder'))}"></div>
      <div class="form-row"><div class="field"><label for="language">${esc(t('language'))}</label><select class="select" id="language" name="lang"><option value="en" ${state.lang==='en'?'selected':''}>English</option><option value="fa" ${state.lang==='fa'?'selected':''}>فارسی</option></select></div>
      <div class="field"><label for="theme">${esc(t('appearance'))}</label><select class="select" id="theme" name="theme"><option value="light" ${state.theme==='light'?'selected':''}>${esc(t('light'))}</option><option value="dark" ${state.theme==='dark'?'selected':''}>${esc(t('dark'))}</option></select></div></div><div><button class="btn btn-primary" type="submit">${ico('check',16)} ${esc(t('saveSettings'))}</button></div></form></div>
      <div class="settings-section"><h3>${esc(t('privacy'))} ${ico('shield',15)}</h3><p>${esc(t('privacyText'))}</p><div class="flex-wrap"><button class="btn btn-light" data-action="export">${ico('download',16)} ${esc(t('export'))}</button>
      <label class="btn btn-ghost" style="cursor:pointer">${ico('upload',16)} ${esc(t('import'))}<input id="importFile" type="file" accept="application/json,.json" hidden></label></div>
      <p>${esc(t('exportHint'))}</p><p>${esc(t('importHint'))}</p><button class="btn btn-danger btn-sm" data-action="erase">${ico('trash',14)} ${esc(t('clearData'))}</button></div>
      <div class="settings-section"><h3>${esc(t('aiSettings'))} ✨</h3><p>${esc(t('aiSettingsText'))}</p>
      <form id="aiForm" class="stack"><div class="field"><label for="aiEndpoint">${esc(t('endpoint'))}</label><input id="aiEndpoint" name="endpoint" class="input" type="url" maxlength="250" value="${esc(state.aiEndpoint)}" placeholder="${esc(t('endpointPlaceholder'))}"></div>
      <label style="display:flex;gap:11px;align-items:flex-start;font-size:11px;line-height:1.7"><input type="checkbox" name="consent" ${state.aiConsent?'checked':''} style="margin-top:4px;accent-color:var(--purple);flex-shrink:0"><span>${esc(t('consent'))}</span></label>
      <div><button class="btn btn-light" type="submit">${ico('check',14)} ${esc(t('aiSave'))}</button></div></form></div>
      <div class="settings-section"><h3>${esc(t('about'))}</h3><p>${esc(t('aboutText'))}</p><div class="notice">${esc(t('personalNote'))}</div></div></div>`;
  }
  function render() {
    renderChrome();
    const views = {home:renderHome,mood:renderMood,planner:renderPlanner,joy:renderJoy,journal:renderJournal,memories:renderMemories,wellness:renderWellness,settings:renderSettings};
    $('#view').innerHTML = (views[page]||renderHome)();
  }
  function navigate(to) {
    if (!NAV.some(n=>n.id===to)) return;
    if (page!==to) {page=to; window.scrollTo({top:0,behavior:'instant'});}
    if (location.hash !== `#${to}`) location.hash=to;
    render();
  }
  function modal(title, body) {
    $('#modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialogTitle"><div class="modal-head"><h2 id="dialogTitle">${esc(title)}</h2><button class="icon-button" data-action="close" aria-label="${esc(t('close'))}">${ico('x')}</button></div>${body}</section></div>`;
    const first = $('.modal input:not([type="hidden"]),.modal textarea,.modal button:not([data-action="close"])');
    if(first) first.focus();
  }
  const closeModal = () => {$('#modalRoot').innerHTML='';};
  function modalFooter(label) {return `<div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="close">${esc(t('cancel'))}</button><button type="submit" class="btn btn-primary">${ico('plus',14)} ${esc(label)}</button></div>`;}
  function favoriteModal() {
    modal(t('addThing'), `<form id="favoriteForm" class="stack"><div class="field"><label for="favName">${esc(t('favoriteName'))}</label><input class="input" id="favName" name="name" maxlength="100" required></div>
      <div class="field"><label for="favType">${esc(t('category'))}</label><select class="select" id="favType" name="type">${TYPES.map(x=>`<option value="${x.id}">${x.icon} ${esc(t(x.id))}</option>`).join('')}</select></div>
      <div class="field"><label for="favEmoji">${esc(t('emoji'))}</label><input class="input" name="emoji" id="favEmoji" maxlength="8" placeholder="💖"></div>
      <div class="field"><label for="favNotes">${esc(t('favoriteNotes'))}</label><textarea class="textarea" id="favNotes" name="notes" maxlength="1500"></textarea></div>${modalFooter(t('add'))}</form>`);
  }
  function ideaModal() {
    modal(t('newIdea'), `<form id="ideaForm" class="stack"><div class="field"><label for="ideaTitle">${esc(t('ideaTitle'))}</label><input class="input" id="ideaTitle" name="title" maxlength="120" required></div>
      <div class="field"><label for="ideaKind">${esc(t('ideaType'))}</label><select class="select" name="kind" id="ideaKind">${['creative','project','personal','reflection'].map(k=>`<option value="${k}">${esc(t(k))}</option>`).join('')}</select></div>
      <div class="field"><label for="ideaContent">${esc(t('ideaContent'))}</label><textarea class="textarea" rows="6" id="ideaContent" name="content" maxlength="8000"></textarea></div>${modalFooter(t('saveIdea'))}</form>`);
  }
  function memoryModal() {
    modal(t('addMemory'), `<form id="memoryForm" class="stack"><div class="field"><label for="memoryTitle">${esc(t('memoryTitle'))}</label><input class="input" id="memoryTitle" name="title" maxlength="120" required></div>
      <div class="form-row"><div class="field"><label for="memoryDate">${esc(t('memoryDate'))}</label><input class="input" id="memoryDate" name="date" type="date" value="${today()}" max="${today()}" required></div><div class="field"><label for="memoryEmoji">${esc(t('emoji'))}</label><input class="input" id="memoryEmoji" name="emoji" maxlength="8" placeholder="🌻"></div></div>
      <div class="field"><label for="memoryContent">${esc(t('memoryContent'))}</label><textarea class="textarea" rows="5" id="memoryContent" name="content" maxlength="8000"></textarea></div>${modalFooter(t('saveMemory'))}</form>`);
  }
  function photoModal() {
    modal(t('addPhoto'), `<form id="photoForm" class="stack"><div class="field"><label for="photoTitle">${esc(t('photoTitle'))}</label><input class="input" name="title" id="photoTitle" maxlength="110" required></div>
      <div class="field"><label for="photoInput">${esc(t('photoFile'))}</label><input class="input" type="file" id="photoInput" accept="image/jpeg,image/png,image/webp" required></div>
      <div class="notice">${esc(t('photoHint'))}</div>${modalFooter(t('addPhoto'))}</form>`);
  }
  function validImage(src) {return typeof src==='string' && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(src) && src.length < 2800000;}
  function compressPhoto(file) {
    return new Promise((resolve,reject)=>{
      if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>6*1024*1024) return reject(new Error('invalid'));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('read'));
      fr.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('image'));
        image.onload = () => {
          try {
            const max = 900, ratio=Math.min(1,max/Math.max(image.width,image.height));
            const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
            const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);
            const data=canvas.toDataURL('image/jpeg',.74);
            validImage(data)?resolve(data):reject(new Error('big'));
          } catch(e){reject(e);}
        };
        image.src=String(fr.result);
      };
      fr.readAsDataURL(file);
    });
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({app:'My Health',version:1,exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});
    const link=document.createElement('a');const url=URL.createObjectURL(blob);
    link.href=url;link.download=`my-health-backup-${today()}.json`;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t('backupCreated'));
  }
  async function importData(file) {
    if (!file || file.size>12*1024*1024) return toast(t('importError'));
    try {
      const input=JSON.parse(await file.text());
      if(input.app!=='My Health'||input.version!==1||!input.data||typeof input.data!=='object'||Array.isArray(input.data)) throw new Error('bad');
      if(!confirm(t('importConfirm'))) return;
      const s={...defaults(),...input.data};
      for(const name of ['moods','favorites','ideas','memories','photos','plans']) {
        if(!Array.isArray(s[name])||s[name].length>10000) throw new Error('array');
        s[name]=s[name].filter(x=>x&&typeof x==='object').map(x=>({...x,id:String(x.id||uid()).slice(0,100)}));
      }
      s.photos=s.photos.filter(p=>validImage(p.src));
      s.lang=['en','fa'].includes(s.lang)?s.lang:'en';
      s.theme=['light','dark'].includes(s.theme)?s.theme:'light';
      s.name=trunc(s.name,60);
      s.wellness=s.wellness&&typeof s.wellness==='object'&&!Array.isArray(s.wellness)?s.wellness:{};
      s.aiConsent=false;s.aiEndpoint='';
      const old=state;state=s;
      if(!save()){state=old;return;}
      closeModal();navigate('home');toast(t('doneImport'));
    } catch{toast(t('importError'));}
  }
  function normalizeAiSlots(data) {
    if(!data||!Array.isArray(data.slots)||data.slots.length<2||data.slots.length>6) throw Error('Invalid response');
    return data.slots.map(slot => ({
      id:uid(),emoji:typeof slot.emoji==='string'?slot.emoji.slice(0,4):'✨',
      title:trunc(slot.title,115),desc:trunc(slot.desc,300),
      duration:Math.min(120,Math.max(5,Number(slot.duration)||10)),done:false
    })).filter(slot=>slot.title&&slot.desc);
  }
  async function generatePlan() {
    const durationEl=$('#planDuration');if(durationEl)plannerDuration=Number(durationEl.value)||60;
    const hasAI=state.aiConsent && /^https:\/\//.test(state.aiEndpoint) && (()=>{try{return new URL(state.aiEndpoint).protocol==='https:';}catch{return false;}})();
    if(hasAI) {
      const btn=$('[data-action="generate-plan"]');if(btn){btn.disabled=true;btn.textContent=state.lang==='fa'?'در حال ساخت…':'Creating…';}
      try {
        const endpoint=new URL(state.aiEndpoint);
        const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),14000);
        let response;
        try {
          response=await fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
            lang:state.lang,mood:latestMood()?t(moodByScore(latestMood().score).key):'not provided',
            energy:plannerEnergy,minutes:plannerDuration,
            favorites:state.favorites.slice(-12).map(x=>({name:trunc(x.name,100),type:x.type}))
          }),signal:controller.signal,credentials:'omit',cache:'no-store'});
        } finally {clearTimeout(timeout);}
        if(!response.ok)throw new Error('Backend unavailable');
        const data=await response.json();
        const slots=normalizeAiSlots(data);
        const p={id:uid(),date:today(),createdAt:new Date().toISOString(),kind:'ai',slots};
        state.plans=state.plans.filter(x=>x.date!==today()).concat(p);save();render();toast(t('aiReady'));return;
      } catch {toast(t('aiFail'));}
    } else if(state.aiConsent) toast(t('aiDisabled'));
    const plan=planFallback();
    state.plans=state.plans.filter(x=>x.date!==today()).concat(plan);
    save();render();
  }
  function handleAction(action) {
    if(action==='close'){closeModal();return;}
    if(action==='favorite')return favoriteModal();
    if(action==='idea')return ideaModal();
    if(action==='memory')return memoryModal();
    if(action==='photo')return photoModal();
    if(action==='theme'){state.theme=state.theme==='light'?'dark':'light';save();render();return;}
    if(action==='language'){state.lang=state.lang==='en'?'fa':'en';save();render();return;}
    if(action==='generate-plan'){generatePlan();return;}
    if(action==='export'){exportData();return;}
    if(action==='menu')return modal(t('more'),`<div class="stack">${NAV.map(x=>`<button class="nav-item" style="background:var(--surface2)" data-nav="${x.id}">${ico(x.icon)} ${esc(t(x.id))}</button>`).join('')}</div>`);
    if(action==='erase' && confirm(t('eraseConfirm'))){state=defaults();selectedMood=null;joyCategory='all';joySearch='';save();closeModal();navigate('home');toast(t('dataCleared'));}
  }
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-nav]');if(nav){event.preventDefault();closeModal();navigate(nav.dataset.nav);return;}
    const mood=event.target.closest('[data-mood]');if(mood){selectedMood=Number(mood.dataset.mood);$$('[data-mood]').forEach(el=>{let active=Number(el.dataset.mood)===selectedMood;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});$('#moodForm button[type="submit"]')?.removeAttribute('disabled');return;}
    const action=event.target.closest('[data-action]');if(action){event.preventDefault();handleAction(action.dataset.action);return;}
    const filter=event.target.closest('[data-filter]');if(filter){joyCategory=filter.dataset.filter;render();$('#joySearch')?.focus();return;}
    const tab=event.target.closest('[data-tab]');if(tab){activeMemoryTab=tab.dataset.tab;render();return;}
    const energy=event.target.closest('[data-energy]');if(energy){plannerEnergy=energy.dataset.energy;$$('[data-energy]').forEach(el=>el.classList.toggle('selected',el.dataset.energy===plannerEnergy));return;}
    const waterSet=event.target.closest('[data-water-set]');if(waterSet){const w=currentWellness();w.water=Number(waterSet.dataset.waterSet);state.wellness[today()]=w;save();render();return;}
    const wellness=event.target.closest('[data-wellness]');if(wellness){
      const [key,change]=wellness.dataset.wellness.split(':');if(!['water','movement','sleep','mindful'].includes(key))return;
      const w=currentWellness(),max={water:30,movement:1440,sleep:24,mindful:1440}[key];
      w[key]=Math.round(Math.max(0,Math.min(max,(w[key]+Number(change))))*10)/10;
      state.wellness[today()]=w;save();render();return;
    }
    const del=event.target.closest('[data-delete]');if(del){
      const collection=del.dataset.delete;if(!['moods','favorites','ideas','memories','photos'].includes(collection))return;
      if(!confirm(t('deleteConfirm')))return;
      state[collection]=state[collection].filter(x=>String(x.id)!==del.dataset.id);save();render();return;
    }
    if(event.target.classList?.contains('modal-backdrop'))closeModal();
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='joySearch'){joySearch=event.target.value;$('#joyGrid').innerHTML=joyGrid();}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='planDuration')plannerDuration=Number(event.target.value)||60;
    if(event.target.id==='importFile'){importData(event.target.files?.[0]);event.target.value='';}
    if(event.target.dataset.planCheck){
      const p=state.plans.find(x=>x.date===today());const slot=p?.slots.find(x=>String(x.id)===event.target.dataset.planCheck);
      if(slot){slot.done=event.target.checked;save();render();}
    }
  });
  document.addEventListener('submit',async event=>{
    const form=event.target;if(!['moodForm','favoriteForm','ideaForm','memoryForm','photoForm','profileForm','aiForm'].includes(form.id))return;
    event.preventDefault();
    const data=new FormData(form),time=new Date().toISOString();
    if(form.id==='moodForm'){
      if(!MOODS.some(x=>x.score===selectedMood))return;
      state.moods.push({id:uid(),time,score:selectedMood,note:trunc($('#moodNote',form)?.value,1200)});if(!save()){state.moods.pop();return;}selectedMood=null;render();toast(t('moodSaved'));
    } else if(form.id==='favoriteForm'){
      const name=trunc(data.get('name')?.trim(),100);if(!name)return toast(t('required'));
      const type=String(data.get('type'));state.favorites.push({id:uid(),time,name,type:TYPES.some(x=>x.id===type)?type:'others',emoji:trunc(data.get('emoji'),8),notes:trunc(data.get('notes'),1500)});if(!save()){state.favorites.pop();return;}closeModal();render();toast(t('savedFavorite'));
    } else if(form.id==='ideaForm'){
      const title=trunc(data.get('title')?.trim(),120);if(!title)return toast(t('required'));
      const kind=String(data.get('kind'));state.ideas.push({id:uid(),time,title,kind:['creative','project','personal','reflection'].includes(kind)?kind:'creative',content:trunc(data.get('content'),8000)});if(!save()){state.ideas.pop();return;}closeModal();render();toast(t('savedIdea'));
    } else if(form.id==='memoryForm'){
      const title=trunc(data.get('title')?.trim(),120);if(!title)return toast(t('required'));
      const date=String(data.get('date'));state.memories.push({id:uid(),time,title,date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:today(),emoji:trunc(data.get('emoji'),8),content:trunc(data.get('content'),8000)});if(!save()){state.memories.pop();return;}closeModal();render();toast(t('savedMemory'));
    } else if(form.id==='photoForm'){
      const button=$('button[type="submit"]',form);if(button)button.disabled=true;
      try {
        const photo=await compressPhoto($('#photoInput',form).files[0]);
        state.photos.push({id:uid(),time,title:trunc(data.get('title')?.trim(),110),src:photo});
        if(!save()){state.photos.pop();return;}
        closeModal();activeMemoryTab='photos';render();toast(t('savedPhoto'));
      } catch {toast(t('invalidPhoto'));}finally{if(button)button.disabled=false;}
    } else if(form.id==='profileForm'){
      state.name=trunc(data.get('name')?.trim(),60);state.lang=String(data.get('lang'))==='fa'?'fa':'en';
      state.theme=String(data.get('theme'))==='dark'?'dark':'light';save();render();toast(t('updated'));
    } else if(form.id==='aiForm'){
      const endpoint=String(data.get('endpoint')||'').trim();
      if(endpoint){try{if(new URL(endpoint).protocol!=='https:')throw new Error('https');}catch{return toast(state.lang==='fa'?'نشانی باید HTTPS معتبر باشه.':'Enter a valid HTTPS backend URL.');}}
      state.aiEndpoint=endpoint;state.aiConsent=data.get('consent')==='on';save();render();toast(t('updated'));
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});
  window.addEventListener('hashchange',()=>{
    const hash=location.hash.slice(1);if(NAV.some(n=>n.id===hash)&&page!==hash){page=hash;render();}
  });
  render();
  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
