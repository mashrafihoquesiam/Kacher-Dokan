/**
 * Kaser Dokan (কাছের দোকান) - Frontend Client Application
 * Hyperlocal Grocery Discovery & Ordering System
 * Supports Interactive Map, $geoNear Spatial Fetching, Cart, Order Tracking,
 * Shop Owner Portal, Database Inspector, and Bangla/English i18n.
 */

// Application State
const state = {
  lang: 'en', // 'en' or 'bn'
  theme: 'light',
  userCoords: { latitude: 23.8103, longitude: 90.4125 }, // Default: Uttara Sector 3, Dhaka
  radius: 200, // in meters
  currentView: 'customer', // 'customer', 'owner', 'database'
  shops: [],
  selectedShop: null,
  activeCart: {
    shopId: null,
    shopName: '',
    items: [],
    subtotal: 0,
    deliveryFee: 20,
    total: 0
  },
  activeOrder: null,
  activeOrders: [],
  selectedPaymentMethod: 'CASH_ON_DELIVERY',
  chatOrderId: null,
  orderContact: null,
  ownerShopId: '65e01a2b8c9d4e001f11a011', // Default: Rahman Grocery
  authToken: localStorage.getItem('kd_auth_token') || '',
  user: null,
  authRole: 'USER',
  authMode: 'login',
  currentDbCollection: 'shops',
  map: null,
  mapMarkers: [],
  userMarker: null,
  radiusCircle: null
};

let ownerRefreshTimer = null;
const realtimeSocket = typeof io === 'function' ? io() : null;
let trackingRefreshTimer = null;

// Bilingual Translations Dictionary
const i18n = {
  en: {
    brand_name: 'Kacher Dokan',
    brand_tagline: 'Nearby shops, easy shopping',
    current_location: 'Current Location',
    nav_customer: 'Customer',
    nav_owner: 'Shop Owner',
    nav_db: 'DB Inspector',
    popular_searches: 'Popular:',
    item_milk: 'Milk',
    item_rice: 'Rice',
    item_eggs: 'Eggs',
    item_oil: 'Soybean Oil',
    item_bread: 'Bread',
    item_salt: 'Salt',
    search_radius: 'Search Radius:',
    nearest_first_note: 'Nearest shops receive highest priority',
    recommended: 'Recommended',
    rad_100: 'Immediate Block',
    rad_200: 'Same Street',
    rad_500: 'Neighborhood',
    rad_1000: 'Extended Area',
    live_map_title: 'Live Hyperlocal Map',
    legend_you: 'You (Customer GPS)',
    legend_open: 'Open Shop',
    legend_closed: 'Closed Shop',
    legend_radius: 'Radius Boundary',
    product_near_me_title: 'Products Available Near You',
    back_to_shops: 'Back to Shops',
    nearby_shops_title: 'Nearby Grocery Shops',
    my_orders: 'My Orders & Live Tracking',
    my_spending_stats: 'My Spending Statistics',
    toggle_shop_status: 'Toggle Open/Closed',
    add_new_product: 'Add Product',
    todays_orders: "Today's Orders",
    todays_sales: "Today's Sales",
    pending_orders: 'Pending Orders',
    inventory_items: 'Products in Stock',
    incoming_orders: 'Incoming Orders',
    inventory_management: 'Inventory Management',
    business_analytics: 'Business Statistics',
    live_order_management: 'Live Order Management & State Machine',
    all_orders: 'All',
    placed: 'New Placed',
    preparing: 'Preparing',
    delivered: 'Delivered',
    shop_inventory_title: 'Products & Live Stock',
    stock_auto_deduct_note: 'Stock automatically deducts upon order placement',
    product: 'Product',
    category: 'Category',
    price: 'Price (৳)',
    stock: 'Stock Level',
    status: 'Status',
    actions: 'Quick Update',
    sales_summary: 'Sales Summary',
    weekly_sales: "This Week's Revenue",
    monthly_sales: "This Month's Revenue",
    avg_order_value: 'Average Order Value (AOV)',
    fulfillment_rate: 'Order Fulfillment Rate',
    top_selling_products: 'Top-Selling Neighborhood Items',
    db_inspector_sub: 'Inspect real MongoDB documents, geospatial 2dsphere indexes, and test raw queries.',
    refresh_db: 'Refresh Database',
    query_runner: 'Live MongoDB Query & Aggregation Runner',
    presets: 'Presets:',
    run_query: 'Execute Query',
    cat_all: 'All Items',
    cat_rice: 'Rice & Grains',
    cat_dairy: 'Dairy & Eggs',
    cat_oil: 'Oil & Spices',
    cat_bakery: 'Bakery',
    cat_snacks: 'Snacks',
    your_cart: 'Your Cart',
    delivery_type: 'Fulfillment Method:',
    home_delivery: 'Home Delivery (৳20)',
    shop_pickup: 'Pick up at Store (Free)',
    delivery_address: 'Delivery Address:',
    phone_number: 'Contact Phone:',
    subtotal: 'Subtotal',
    delivery_fee: 'Neighborhood Delivery Fee',
    total_amount: 'Total Amount',
    confirm_place_order: 'Place Order (Cash on Delivery)',
    live_tracking_title: 'Hyperlocal Live Order Tracking',
    step_placed: 'Order Placed',
    step_placed_desc: 'Received by shop system',
    step_accepted: 'Order Accepted',
    step_accepted_desc: 'Shop owner verified stock',
    step_preparing: 'Preparing & Packing',
    step_preparing_desc: 'Packing fresh items',
    step_ready: 'Ready for Pickup / Delivery',
    step_ready_desc: 'Package is ready',
    step_out_for_delivery: 'Out for Delivery',
    step_delivery_desc: 'Neighborhood assistant heading to your address',
    step_delivered: 'Delivered',
    step_delivered_desc: 'Order fulfilled successfully',
    call_shop: 'Call Shop: 01811000002',
    add_product_title: 'Add New Product to Shop',
    product_name_en: 'Product Name (English):',
    product_name_bn: 'Product Name (Bangla):',
    unit: 'Unit / Weight:',
    save_to_mongodb: 'Save Product to MongoDB',

    inventory_label: 'INVENTORY', add_product_subtitle: 'Add product details, stock, availability and photo.', brand_optional: 'Brand (optional):', product_details_optional: 'Product details (optional):', product_photo: 'Product Photo', choose_default: 'Choose Default', upload_photo: 'Upload Photo', photo_preview: 'Photo preview', customer_availability: 'Customer availability', availability_help: 'Turn off to keep the product in inventory without allowing orders.', unavailable_help: 'Unavailable keeps the item in inventory but blocks ordering.', product_tip: 'Tip: use a clear square photo and enter stock before saving.', edit_product: 'Edit Product', changes_shared: 'Changes are shared with customers immediately.', product_name: 'Product Name', bangla_name: 'Bangla Name', delete_product: 'Delete Product', save_changes: 'Save Changes', order_chat: 'Order Chat', chat_private: 'Private order conversation · Customer / Seller / assigned Rider only', send: 'Send', available: 'Available', unavailable: 'Unavailable', low_stock: 'Low Stock', out_of_stock: 'Out of Stock', save: 'Save', restock: 'Restock', no_products: 'No products yet.',
    analytics_title: 'Seller Analytics', analytics_subtitle: 'Live figures calculated from your actual orders.', refresh: 'Refresh', analytics_loading: 'Loading analytics…', today_revenue: "Today's Revenue", this_week: 'This Week', this_month: 'This Month', average_order: 'Average Order', completed: 'Completed', cancelled: 'Cancelled', fulfillment: 'Fulfillment', last_7_days: 'Last 7 Days Revenue',
    delivery_partner: 'DELIVERY PARTNER', rider_dashboard: 'Rider Dashboard', rider_intro: 'Nearby delivery orders will appear here when you are available.', nearby_delivery_orders: 'Nearby Delivery Orders', nearby_delivery_sub: 'Delivery orders from shops around your current location.', assigned_deliveries: 'My Assigned Deliveries', assigned_deliveries_sub: 'Accepted jobs, pickup code and delivery status.', looking_orders: 'Looking for nearby orders...', no_assigned_delivery: 'No assigned delivery yet.',
    custom_category_help: 'Choose Others / Custom to enter any category you want.', basic_information: 'Basic information', pricing_stock: 'Price & stock', media_availability: 'Photo & availability', add_product_cta: 'Add Product to Inventory', initial_stock: 'Initial Stock Quantity:', unit_placeholder: 'e.g. 1 Litre, 500 gm, 12 pcs', product_name_en_placeholder: 'e.g. Radhuni Mustard Oil', product_name_bn_placeholder: 'e.g. Bangla product name',
    order_voice_follows_ui: 'Voice follows interface language', manage_product: 'Manage Product', low_stock_reminder: 'Important stock reminder', low_stock_sub: 'Products with fewer than 5 items', repeat_voice: 'Play again', remaining: 'remaining', image_too_large: 'Image must be smaller than 4 MB.', image_read_failed: 'Unable to read selected image.', image_upload_failed: 'Image upload failed.', voice_fallback: 'Online voice unavailable — using device voice.', voice_unavailable: 'Voice is temporarily unavailable. The notification remains visible on the dashboard.', greeting: 'Greeting', replay_last_order: 'Replay Last Order',
    logout: 'Log out', rider: 'Rider', loading_nearby_shops: 'Loading nearby shops...', shops_word: 'Shops', shop_word: 'Shop', searching_shops: 'Searching nearby shops...', search_failed: 'Failed to search products.', reviews: 'reviews', delivery_short: 'Delivery', pickup_only: 'Pickup Only', cart_empty: 'Your cart is empty', cart_empty_help: 'Add items from one or more nearby shops', pickup: 'Pickup', each: 'each', my_orders_title: 'My Orders', my_orders_help: 'Each shop has separate tracking, rider, chat and pickup code.', no_orders: 'No orders yet.', track: 'Track', chat: 'Chat', loading_orders: 'Loading orders…', order_word: 'Order', order_summary: 'Order Summary', total: 'Total', call_customer: 'Call Customer', call_shop_short: 'Call Shop', loading_conversation: 'Loading conversation…', chat_load_failed: 'Unable to load chat.', no_messages: 'No messages yet. Say hello 👋', no_orders_shop: 'No orders found for this shop.', open: 'Open', closed: 'Closed', collection: 'Collection', showing_documents: 'Showing {count} documents', returned_results: 'Returned {count} results', error_loading_documents: 'Error loading documents.', weather_loading: 'Loading weather...', rider_requests: 'Rider Delivery Requests', rider_requests_help: 'Nearby riders who offered to deliver your orders.', no_rider_requests: 'No rider requests yet.', order_status_summary: 'Order Status Summary', payment_method: 'Payment Method:', cash: 'Cash', payment_demo_note: 'Mobile payments are in demo mode until official merchant credentials are configured.', chat_with_shop: 'Chat with Shop', live_sync_note: 'Tracking and chat update live while this page is open.', profile: 'Profile', my_profile: 'MY PROFILE', choose_photo: 'Choose Photo', remove: 'Remove', image_file_note: 'PNG/JPG/WEBP, max 4 MB.', full_name: 'Full Name', role: 'Role', phone: 'Phone', email: 'Email', address: 'Address', vehicle_type: 'Vehicle Type', bicycle: 'Bicycle', motorcycle: 'Motorcycle', scooter: 'Scooter', walking: 'Walking', rider_verification: 'Rider Verification', rider_verification_help: 'Optional for this demo build. Documents are stored privately.', not_submitted: 'NOT SUBMITTED', id_type: 'ID Type', choose: 'Choose', national_id: 'National ID', birth_certificate: 'Birth Certificate', id_number: 'ID / Birth Certificate Number', permanent_address: 'Permanent Address', id_file: 'NID / Birth Certificate File', optional_3mb: 'Optional · max 3 MB', utility_bill: 'Electricity / Gas / Utility Bill', shop_details: 'Shop Details', shop_name_en: 'Shop Name (English)', shop_name_bn: 'Shop Name (Bangla)', shop_address: 'Shop Address', save_profile: 'Save Profile', activity: 'ACTIVITY', notifications: 'Notifications', no_notifications: 'No notifications yet.', get_started: 'Get Started', choose_account: 'Choose your account', choose_account_help: 'How will you use Kacher Dokan?', customer: 'Customer', customer_sub: 'Shop for groceries', owner: 'Shop Owner', owner_sub: 'Manage your shop', rider_sub: 'Deliver nearby orders', back: 'Back', customer_account: 'Customer account', owner_account: 'Shop owner account', rider_account: 'Rider account', login_or_create: 'Log in or create your account.', login: 'Log in', register: 'Register', password: 'Password', email_or_phone: 'Email or phone', demo_accounts: 'Demo accounts use password:', auth_hero_title: 'Find nearby. Shop easily.', auth_hero_sub: 'Your neighborhood shops, all in one place', auth_language_toggle: 'Bangla / English', rider_identity_verification: 'Rider identity verification', rider_identity_help: 'Optional for now · helps seller/customer trust and future verification.', id_document: 'NID / Birth Certificate', utility_short: 'Electricity / Gas Bill', permanent_proof: 'Permanent-address proof · optional · max 3 MB', db_connected: 'Connected to configured MongoDB', db_loading_documents: 'Loading documents from database...', away: 'away', estimated_delivery: 'Estimated delivery time', minutes: 'mins', from_shop: 'From', low_stock_badge: 'Low Stock',
  },
  bn: {
    brand_name: 'কাছের দোকান',
    brand_tagline: 'কাছের দোকান, সহজ কেনাকাটা',
    current_location: 'বর্তমান লোকেশন',
    nav_customer: 'ক্রেতা',
    nav_owner: 'দোকানদার',
    nav_db: 'ডাটাবেজ পরিদর্শক',
    popular_searches: 'জনপ্রিয় অনুসন্ধান:',
    item_milk: 'দুধ',
    item_rice: 'চাল',
    item_eggs: 'ডিম',
    item_oil: 'সয়াবিন তেল',
    item_bread: 'পাউরুটি',
    item_salt: 'লবণ',
    search_radius: 'অনুসন্ধান এরিয়া:',
    nearest_first_note: 'সবচেয়ে কাছের দোকান সবার প্রথমে প্রদর্শিত হবে',
    recommended: 'সুপারিশকৃত',
    rad_100: '১০০ মিটার (নিকটতম)',
    rad_200: '২০০ মিটার (একই রোড)',
    rad_500: '৫০০ মিটার (মহল্লা)',
    rad_1000: '১ কি.মি. (সম্পূর্ণ এলাকা)',
    live_map_title: 'লাইভ ম্যাপ ভিউ',
    legend_you: 'আপনি (আপনার জিপিএস)',
    legend_open: 'খোলা দোকান',
    legend_closed: 'বন্ধ দোকান',
    legend_radius: 'সার্চ এরিয়া বাউন্ডারি',
    product_near_me_title: 'আপনার কাছে পাওয়া যাচ্ছে এমন পণ্য',
    back_to_shops: 'দোকানের তালিকায় ফিরুন',
    nearby_shops_title: 'কাছের মুদি দোকানসমূহ',
    my_orders: 'আমার অর্ডার ও লাইভ ট্র্যাকিং',
    my_spending_stats: 'আমার খরচের পরিসংখ্যান',
    toggle_shop_status: 'দোকান খোলা/বন্ধ পরিবর্তন',
    add_new_product: 'নতুন পণ্য যোগ করুন',
    todays_orders: 'আজকের অর্ডার',
    todays_sales: 'আজকের মোট বিক্রি',
    pending_orders: 'প্রক্রিয়াধীন অর্ডার',
    inventory_items: 'মজুদ পণ্য সংখ্যা',
    incoming_orders: 'নতুন আসা অর্ডার',
    inventory_management: 'পণ্য ও স্টক পরিচালনা',
    business_analytics: 'দোকানের ব্যবসায়িক হিসাব',
    live_order_management: 'লাইভ অর্ডার ব্যবস্থাপনা',
    all_orders: 'সকল',
    placed: 'নতুন অর্ডার',
    preparing: 'প্রস্তুত হচ্ছে',
    delivered: 'সম্পন্ন',
    shop_inventory_title: 'দোকানের পণ্য ও রিয়েলটাইম স্টক',
    stock_auto_deduct_note: 'অর্ডার করার সাথে সাথে ডাটাবেজে স্টক কমে যায়',
    product: 'পণ্য',
    category: 'ক্যাটাগরি',
    price: 'মূল্য (৳)',
    stock: 'মজুদ সংখ্যা',
    status: 'অবস্থা',
    actions: 'আপডেট',
    sales_summary: 'বিক্রির বিবরণী',
    weekly_sales: 'এই সপ্তাহের মোট আয়',
    monthly_sales: 'এই মাসের মোট আয়',
    avg_order_value: 'গড় অর্ডার মূল্য',
    fulfillment_rate: 'সফল ডেলিভারির হার',
    top_selling_products: 'মহল্লায় সর্বাধিক বিক্রিত পণ্য',
    db_inspector_sub: 'ডাটাবেজের আসল তথ্য, স্থানভিত্তিক সূচক এবং কাঁচা কোয়েরি পরীক্ষা করুন।',
    refresh_db: 'ডাটাবেজ রিফ্রেশ করুন',
    query_runner: 'লাইভ ডাটাবেজ কোয়েরি ও সমন্বিত অনুসন্ধান',
    presets: 'রেডিমেড কোয়েরি:',
    run_query: 'কোয়েরি রান করুন',
    cat_all: 'সকল পণ্য',
    cat_rice: 'চাল ও ডাল',
    cat_dairy: 'দুধ ও ডিম',
    cat_oil: 'তেল ও মসলা',
    cat_bakery: 'বেকারি ও রুটি',
    cat_snacks: 'চা ও নাশতা',
    your_cart: 'আপনার শপিং কার্ট',
    delivery_type: 'ডেলিভারি মাধ্যম:',
    home_delivery: 'বাসায় ডেলিভারি (৳২০)',
    shop_pickup: 'দোকান থেকে সংগ্রহ (ফ্রি)',
    delivery_address: 'ডেলিভারি ঠিকানা:',
    phone_number: 'মোবাইল নাম্বার:',
    subtotal: 'সাবটোটাল',
    delivery_fee: 'মহল্লা ডেলিভারি চার্জ',
    total_amount: 'সর্বমোট প্রদেয়',
    confirm_place_order: 'অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)',
    live_tracking_title: 'লাইভ অর্ডার ট্র্যাকিং',
    step_placed: 'অর্ডার গৃহীত হয়েছে',
    step_placed_desc: 'দোকানদারের সিস্টেমে পৌঁছেছে',
    step_accepted: 'দোকানদার কনফার্ম করেছে',
    step_accepted_desc: 'স্টক ভেরিফাই করা হয়েছে',
    step_preparing: 'প্যাকেট প্রস্তুত হচ্ছে',
    step_preparing_desc: 'পণ্য সাজানো হচ্ছে',
    step_ready: 'ডেলিভারির জন্য প্রস্তুত',
    step_ready_desc: 'পার্সেল প্রস্তুত',
    step_out_for_delivery: 'ডেলিভারি বয় পথে আছে',
    step_delivery_desc: 'আপনার ঠিকানায় পৌঁছে যাচ্ছে',
    step_delivered: 'ডেলিভারি সম্পন্ন',
    step_delivered_desc: 'সফলভাবে পণ্য হস্তান্তর হয়েছে',
    call_shop: 'দোকানে কল দিন: ০১৮১১০০০০০২',
    add_product_title: 'দোকানে নতুন পণ্য যোগ করুন',
    product_name_en: 'পণ্যের ইংরেজি নাম:',
    product_name_bn: 'পণ্যের নাম (বাংলা):',
    unit: 'ওজন / একক:',
    save_to_mongodb: 'ডাটাবেজে সংরক্ষণ করুন',

    inventory_label: 'ইনভেন্টরি', add_product_subtitle: 'পণ্যের তথ্য, স্টক, প্রাপ্যতা ও ছবি যোগ করুন।', brand_optional: 'ব্র্যান্ড (ঐচ্ছিক):', product_details_optional: 'পণ্যের বিবরণ (ঐচ্ছিক):', product_photo: 'পণ্যের ছবি', choose_default: 'ডিফল্ট ছবি', upload_photo: 'ছবি আপলোড', photo_preview: 'ছবির প্রিভিউ', customer_availability: 'ক্রেতার জন্য প্রাপ্যতা', availability_help: 'বন্ধ রাখলে পণ্য ইনভেন্টরিতে থাকবে কিন্তু অর্ডার করা যাবে না।', unavailable_help: 'অনুপলব্ধ রাখলে পণ্য তালিকায় থাকবে কিন্তু অর্ডার করা যাবে না।', product_tip: 'পরামর্শ: পরিষ্কার বর্গাকার ছবি দিন এবং সেভ করার আগে স্টক লিখুন।', edit_product: 'পণ্য সম্পাদনা', changes_shared: 'পরিবর্তন সঙ্গে সঙ্গে ক্রেতাদের কাছে দেখা যাবে।', product_name: 'পণ্যের নাম', bangla_name: 'বাংলা নাম', delete_product: 'পণ্য মুছুন', save_changes: 'পরিবর্তন সেভ করুন', order_chat: 'অর্ডার চ্যাট', chat_private: 'ব্যক্তিগত অর্ডার কথোপকথন · শুধু ক্রেতা / দোকানদার / নির্ধারিত রাইডার', send: 'পাঠান', available: 'প্রাপ্য', unavailable: 'অনুপলব্ধ', low_stock: 'স্টক কম', out_of_stock: 'স্টক শেষ', save: 'সেভ', restock: 'রিস্টক', no_products: 'এখনও কোনো পণ্য নেই।',
    analytics_title: 'বিক্রয় বিশ্লেষণ', analytics_subtitle: 'আপনার আসল অর্ডার থেকে লাইভ হিসাব।', refresh: 'রিফ্রেশ', analytics_loading: 'হিসাব লোড হচ্ছে…', today_revenue: 'আজকের আয়', this_week: 'এই সপ্তাহ', this_month: 'এই মাস', average_order: 'গড় অর্ডার', completed: 'সম্পন্ন', cancelled: 'বাতিল', fulfillment: 'সফলতার হার', last_7_days: 'গত ৭ দিনের আয়',
    delivery_partner: 'ডেলিভারি পার্টনার', rider_dashboard: 'রাইডার ড্যাশবোর্ড', rider_intro: 'আপনি উপলভ্য থাকলে কাছাকাছি ডেলিভারি অর্ডার এখানে দেখা যাবে।', nearby_delivery_orders: 'কাছাকাছি ডেলিভারি অর্ডার', nearby_delivery_sub: 'আপনার বর্তমান লোকেশনের আশেপাশের দোকানের ডেলিভারি অর্ডার।', assigned_deliveries: 'আমার নেওয়া ডেলিভারি', assigned_deliveries_sub: 'গ্রহণ করা কাজ, পিকআপ কোড ও ডেলিভারি অবস্থা।', looking_orders: 'কাছাকাছি অর্ডার খোঁজা হচ্ছে...', no_assigned_delivery: 'এখনও কোনো ডেলিভারি নেওয়া হয়নি।',
    custom_category_help: 'নিজের ক্যাটাগরি লিখতে অন্যান্য / নিজের ক্যাটাগরি নির্বাচন করুন।', basic_information: 'পণ্যের মূল তথ্য', pricing_stock: 'দাম ও স্টক', media_availability: 'ছবি ও প্রাপ্যতা', add_product_cta: 'ইনভেন্টরিতে পণ্য যোগ করুন', initial_stock: 'প্রাথমিক স্টক পরিমাণ:', unit_placeholder: 'যেমন: ১ লিটার, ৫০০ গ্রাম, ১২টি', product_name_en_placeholder: 'যেমন: রাঁধুনী সরিষার তেল', product_name_bn_placeholder: 'যেমন: রাঁধুনী সরিষার তেল',
    order_voice_follows_ui: 'ভয়েস ইন্টারফেসের ভাষা অনুসরণ করবে', manage_product: 'পণ্য পরিচালনা', low_stock_reminder: 'গুরুত্বপূর্ণ স্টক রিমাইন্ডার', low_stock_sub: '৫টির কম থাকা পণ্য', repeat_voice: 'আবার শুনুন', remaining: 'বাকি', image_too_large: 'ছবির আকার ৪ মেগাবাইটের কম হতে হবে।', image_read_failed: 'নির্বাচিত ছবি পড়া যায়নি।', image_upload_failed: 'ছবি আপলোড করা যায়নি।', voice_fallback: 'অনলাইন ভয়েস পাওয়া যায়নি — ডিভাইসের ভয়েস ব্যবহার হচ্ছে।', voice_unavailable: 'ভয়েস সাময়িকভাবে পাওয়া যাচ্ছে না। নোটিফিকেশন ড্যাশবোর্ডে থাকবে।', greeting: 'শুভেচ্ছা শুনুন', replay_last_order: 'শেষ অর্ডার আবার শুনুন',
    logout: 'লগআউট', rider: 'রাইডার', loading_nearby_shops: 'কাছের দোকান খোঁজা হচ্ছে...', shops_word: 'দোকান', shop_word: 'দোকান', searching_shops: 'কাছের দোকান খোঁজা হচ্ছে...', search_failed: 'পণ্য খোঁজা যায়নি।', reviews: 'পর্যালোচনা', delivery_short: 'ডেলিভারি', pickup_only: 'দোকান থেকে সংগ্রহ', cart_empty: 'আপনার কার্ট খালি', cart_empty_help: 'কাছের এক বা একাধিক দোকান থেকে পণ্য যোগ করুন', pickup: 'দোকান থেকে সংগ্রহ', each: 'প্রতি', my_orders_title: 'আমার অর্ডার', my_orders_help: 'প্রতিটি দোকানের জন্য আলাদা ট্র্যাকিং, রাইডার, চ্যাট ও সংগ্রহ কোড থাকবে।', no_orders: 'এখনও কোনো অর্ডার নেই।', track: 'ট্র্যাক করুন', chat: 'চ্যাট', loading_orders: 'অর্ডার লোড হচ্ছে…', order_word: 'অর্ডার', order_summary: 'অর্ডারের সারসংক্ষেপ', total: 'মোট', call_customer: 'ক্রেতাকে কল করুন', call_shop_short: 'দোকানে কল করুন', loading_conversation: 'কথোপকথন লোড হচ্ছে…', chat_load_failed: 'চ্যাট লোড করা যায়নি।', no_messages: 'এখনও কোনো বার্তা নেই। প্রথম বার্তা পাঠান 👋', no_orders_shop: 'এই দোকানে কোনো অর্ডার পাওয়া যায়নি।', open: 'খোলা', closed: 'বন্ধ', collection: 'সংগ্রহ', showing_documents: '{count}টি নথি দেখানো হচ্ছে', returned_results: '{count}টি ফলাফল পাওয়া গেছে', error_loading_documents: 'নথি লোড করা যায়নি।', weather_loading: 'আবহাওয়ার তথ্য লোড হচ্ছে...', rider_requests: 'রাইডার ডেলিভারি অনুরোধ', rider_requests_help: 'কাছাকাছি যেসব রাইডার আপনার অর্ডার ডেলিভারির প্রস্তাব দিয়েছেন।', no_rider_requests: 'এখনও কোনো রাইডার অনুরোধ নেই।', order_status_summary: 'অর্ডারের অবস্থার সারসংক্ষেপ', payment_method: 'পেমেন্ট পদ্ধতি:', cash: 'নগদ', payment_demo_note: 'অফিশিয়াল মার্চেন্ট তথ্য যুক্ত না হওয়া পর্যন্ত মোবাইল পেমেন্ট পরীক্ষামূলক মোডে চলবে।', chat_with_shop: 'দোকানের সাথে চ্যাট', live_sync_note: 'এই পৃষ্ঠা খোলা থাকলে ট্র্যাকিং ও চ্যাট লাইভ আপডেট হবে।', profile: 'প্রোফাইল', my_profile: 'আমার প্রোফাইল', choose_photo: 'ছবি বাছাই করুন', remove: 'সরান', image_file_note: 'পিএনজি/জেপিজি/ওয়েবপি, সর্বোচ্চ ৪ মেগাবাইট।', full_name: 'পূর্ণ নাম', role: 'ভূমিকা', phone: 'ফোন', email: 'ইমেইল', address: 'ঠিকানা', vehicle_type: 'যানের ধরন', bicycle: 'সাইকেল', motorcycle: 'মোটরসাইকেল', scooter: 'স্কুটার', walking: 'হেঁটে', rider_verification: 'রাইডার যাচাই', rider_verification_help: 'এই প্রদর্শনী সংস্করণে এটি ঐচ্ছিক। নথি ব্যক্তিগতভাবে সংরক্ষিত হয়।', not_submitted: 'জমা দেওয়া হয়নি', id_type: 'পরিচয়পত্রের ধরন', choose: 'বাছাই করুন', national_id: 'জাতীয় পরিচয়পত্র', birth_certificate: 'জন্মনিবন্ধন', id_number: 'পরিচয়পত্র / জন্মনিবন্ধন নম্বর', permanent_address: 'স্থায়ী ঠিকানা', id_file: 'পরিচয়পত্র / জন্মনিবন্ধনের ফাইল', optional_3mb: 'ঐচ্ছিক · সর্বোচ্চ ৩ মেগাবাইট', utility_bill: 'বিদ্যুৎ / গ্যাস / ইউটিলিটি বিল', shop_details: 'দোকানের তথ্য', shop_name_en: 'দোকানের ইংরেজি নাম', shop_name_bn: 'দোকানের বাংলা নাম', shop_address: 'দোকানের ঠিকানা', save_profile: 'প্রোফাইল সংরক্ষণ করুন', activity: 'কার্যক্রম', notifications: 'নোটিফিকেশন', no_notifications: 'এখনও কোনো নোটিফিকেশন নেই।', get_started: 'শুরু করুন', choose_account: 'অ্যাকাউন্টের ধরন বাছাই করুন', choose_account_help: 'আপনি কাছের দোকান কীভাবে ব্যবহার করবেন?', customer: 'ক্রেতা', customer_sub: 'মুদিপণ্য কিনুন', owner: 'দোকানদার', owner_sub: 'আপনার দোকান পরিচালনা করুন', rider_sub: 'কাছাকাছি অর্ডার ডেলিভারি করুন', back: 'ফিরে যান', customer_account: 'ক্রেতা অ্যাকাউন্ট', owner_account: 'দোকানদার অ্যাকাউন্ট', rider_account: 'রাইডার অ্যাকাউন্ট', login_or_create: 'লগইন করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।', login: 'লগইন', register: 'নিবন্ধন', password: 'পাসওয়ার্ড', email_or_phone: 'ইমেইল অথবা ফোন', demo_accounts: 'ডেমো অ্যাকাউন্টের পাসওয়ার্ড:', auth_hero_title: 'কাছের দোকান খুঁজুন, সহজে কেনাকাটা করুন।', auth_hero_sub: 'আপনার আশেপাশের দোকান, এক জায়গায়', auth_language_toggle: 'বাংলা / ইংরেজি', rider_identity_verification: 'রাইডার পরিচয় যাচাই', rider_identity_help: 'এখন এটি ঐচ্ছিক · দোকানদার ও ক্রেতার আস্থা বাড়াতে সহায়ক।', id_document: 'জাতীয় পরিচয়পত্র / জন্মনিবন্ধন', utility_short: 'বিদ্যুৎ / গ্যাস বিল', permanent_proof: 'স্থায়ী ঠিকানার প্রমাণ · ঐচ্ছিক · সর্বোচ্চ ৩ মেগাবাইট', db_connected: 'কনফিগার করা ডাটাবেজে সংযুক্ত', db_loading_documents: 'ডাটাবেজ থেকে নথি লোড হচ্ছে...', away: 'দূরে', estimated_delivery: 'আনুমানিক ডেলিভারি সময়', minutes: 'মিনিট', from_shop: 'দোকান', low_stock_badge: 'স্টক কম',
  }
};

// Shared language helpers. Keep every system-controlled label/message on one UI language.
function ui(englishText, banglaText) {
  return state.lang === 'bn' ? banglaText : englishText;
}

function uiKey(key, params = {}) {
  const table = i18n[state.lang] || i18n.en;
  let value = table?.[key] ?? i18n.en?.[key] ?? key;
  Object.entries(params || {}).forEach(([name, replacement]) => {
    value = String(value).replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function localizedRole(role) {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'SHOP_OWNER') return uiKey('owner');
  if (normalized === 'RIDER') return uiKey('rider');
  if (normalized === 'ADMIN') return state.lang === 'bn' ? 'অ্যাডমিন' : 'Admin';
  return uiKey('customer');
}

// Initialize Application
// Critical controls (auth/language) must be wired before optional integrations such as Leaflet.
// This keeps the app usable even when a CDN or map tile service is unavailable.
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  initLanguage();

  try {
    initLeafletMap();
  } catch (err) {
    console.warn('Map initialization skipped:', err);
    showMapUnavailableState();
  }

  restoreSession();
});

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  return fetch(url, { ...options, headers });
}

async function restoreSession() {
  if (!state.authToken) {
    showLoginOverlay();
    return;
  }

  try {
    const res = await apiFetch('/api/auth/me');
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    applyAuthenticatedUser(data.user, data.shops || []);
  } catch (err) {
    clearSession();
    showLoginOverlay();
  }
}

function applyAuthenticatedUser(user, shops) {
  state.user = user;
  if (user.role === 'SHOP_OWNER' && shops.length) {
    state.ownerShopId = shops[0]._id;
    const shop = shops[0];
    document.getElementById('ownerShopName').textContent = state.lang === 'bn' ? (shop.shopNameBn || shop.shopName) : shop.shopName;
    document.getElementById('ownerShopAddress').textContent = `${shop.address} • ${uiKey('phone')}: ${shop.phone}`;
  }

  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('authUserMenu').style.display = 'flex';
  document.getElementById('authUserName').textContent = `${user.name} (${localizedRole(user.role)})`;

  const isOwner = user.role === 'SHOP_OWNER';
  const isAdmin = user.role === 'ADMIN';
  document.getElementById('btnCustomerView').style.display = isOwner ? 'none' : '';
  document.getElementById('btnOwnerView').style.display = isOwner ? '' : 'none';
  document.getElementById('btnDbView').style.display = isAdmin ? '' : 'none';

  const defaultView = isOwner ? 'owner' : isAdmin ? 'database' : 'customer';
  activateView(defaultView);
  if (!isOwner && !isAdmin) fetchNearbyShops();
  if (isOwner) loadOwnerDashboard();
  if (ownerRefreshTimer) clearInterval(ownerRefreshTimer);
  ownerRefreshTimer = isOwner ? setInterval(loadOwnerDashboard, 10000) : null;
  if (isAdmin) loadDbInspector();
}

function showLoginOverlay() {
  document.getElementById('authOverlay').style.display = 'flex';
  document.getElementById('authUserMenu').style.display = 'none';
  document.getElementById('authWelcome').style.display = 'flex';
  document.getElementById('authRoleStep').style.display = 'none';
  document.getElementById('authFormStep').style.display = 'none';
}

function clearSession() {
  state.authToken = '';
  state.user = null;
  localStorage.removeItem('kd_auth_token');
  if (ownerRefreshTimer) clearInterval(ownerRefreshTimer);
  ownerRefreshTimer = null;
}

function activateView(view) {
  const button = document.querySelector(`.view-btn[data-view="${view}"]`);
  if (!button || button.style.display === 'none') return;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === button));
  state.currentView = view;
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`${view}View`).classList.add('active');
  if (view === 'owner') loadOwnerDashboard();
  if (view === 'database') loadDbInspector();
  if (view === 'customer' && state.map) setTimeout(() => state.map.invalidateSize(), 200);
}

async function handleLogin(event) {
  event.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  const isRegistering = state.authMode === 'register';
  const identifier = isRegistering ? document.getElementById('registerEmail').value.trim() : document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const body = isRegistering
      ? { name: document.getElementById('registerName').value.trim(), email: identifier, phone: document.getElementById('registerPhone').value.trim(), password, role: state.authRole, language: state.lang }
      : { identifier, password, role: state.authRole };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed.');
    state.authToken = data.token;
    localStorage.setItem('kd_auth_token', data.token);
    applyAuthenticatedUser(data.user, data.shops || []);
    document.getElementById('loginForm').reset();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

// Theme Management
function initTheme() {
  const saved = localStorage.getItem('kd_theme') || 'light';
  state.theme = saved;
  document.body.className = `theme-${saved}`;
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.querySelector('#btnThemeToggle i');
  if (icon) {
    icon.className = state.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

// Language Management
function initLanguage() {
  const saved = localStorage.getItem('kd_lang') || 'en';
  setLanguage(saved);
}

function setLanguage(lang) {
  state.lang = lang === 'bn' ? 'bn' : 'en';
  lang = state.lang;
  localStorage.setItem('kd_lang', lang);
  // One language controls BOTH the interface and every spoken alert.
  state.voiceAlertLanguage = lang;
  localStorage.setItem('kd_voice_language', lang);
  const voiceSelect = document.getElementById('voiceLanguageSelect');
  if (voiceSelect) { voiceSelect.value = lang; voiceSelect.disabled = true; voiceSelect.title = i18n[lang]?.order_voice_follows_ui || ''; }
  if (state.authToken) {
    apiFetch('/api/auth/language', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({language:lang}) }).catch(()=>{});
  }

  // Update button classes
  document.getElementById('btnLangBn')?.classList.toggle('active', lang === 'bn');
  document.getElementById('btnLangEn')?.classList.toggle('active', lang === 'en');

  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  // Keep language-sensitive form options and placeholders consistent too.
  document.querySelectorAll('#newProdCategory option[data-en][data-bn]').forEach(option => { option.textContent = option.dataset[lang] || option.textContent; });
  document.querySelectorAll('[data-placeholder-en][data-placeholder-bn]').forEach(el => { el.placeholder = el.dataset[lang === 'bn' ? 'placeholderBn' : 'placeholderEn'] || el.placeholder; });
  document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  const voiceHint = document.getElementById('voiceLanguageHint');
  if (voiceHint) voiceHint.textContent = i18n[lang]?.order_voice_follows_ui || '';
  // Strict interface language: all application-controlled labels follow one selected language.
  const langBn = lang === 'bn';
  document.title = langBn ? 'কাছের দোকান — কাছাকাছি কেনাকাটা ও ডেলিভারি' : 'Kacher Dokan — Hyperlocal Grocery & Delivery';
  const bnBtn = document.getElementById('btnLangBn'); if (bnBtn) bnBtn.textContent = langBn ? '🇧🇩 বাংলা' : '🇧🇩 Bangla';
  const enBtn = document.getElementById('btnLangEn'); if (enBtn) enBtn.textContent = langBn ? '🇬🇧 ইংরেজি' : '🇬🇧 English';
  const authBnBtn = document.getElementById('btnAuthBn');
  const authEnBtn = document.getElementById('btnAuthEn');
  if (authBnBtn) { authBnBtn.textContent = langBn ? 'বাংলা' : 'Bangla'; authBnBtn.classList.toggle('active', langBn); }
  if (authEnBtn) { authEnBtn.textContent = langBn ? 'ইংরেজি' : 'English'; authEnBtn.classList.toggle('active', !langBn); }
  const logout = document.getElementById('btnLogout'); if (logout) logout.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> ${uiKey('logout')}`;
  if (state.user) { const n=document.getElementById('authUserName'); if(n) n.textContent=`${state.user.name} (${localizedRole(state.user.role)})`; }
  const weather = document.getElementById('sellerWeatherText'); if (weather && /Weather loading|আবহাওয়ার তথ্য/.test(weather.textContent)) weather.textContent=uiKey('weather_loading');
  const voiceOpts = document.querySelectorAll('#voiceLanguageSelect option'); if (voiceOpts[0]) voiceOpts[0].textContent = langBn ? 'বাংলা' : 'Bangla'; if (voiceOpts[1]) voiceOpts[1].textContent = langBn ? 'ইংরেজি' : 'English';
  document.querySelectorAll('.radius-btn').forEach(btn => { const r=Number(btn.dataset.radius||0); const v=btn.querySelector('.radius-val'); if(v) v.textContent = langBn ? (r===1000?'১ কি.মি.':`${String(r).replace(/[0-9]/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)])} মি.`) : (r===1000?'1 km':`${r}m`); });
  const authToggle=document.getElementById('btnAuthLanguage'); if(authToggle) authToggle.textContent=uiKey('auth_language_toggle');

  // Re-render shops to apply Bangla/English shop names
  renderShopsList(state.shops);
  if (state.selectedShop && Array.isArray(state.selectedShop.products)) renderStoreProducts(state.selectedShop.products, state.selectedShop);
  if (state.user?.role === 'SHOP_OWNER' && typeof loadOwnerInventory === 'function') loadOwnerInventory();
}


// Setup Event Listeners
function setupEventListeners() {
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('btnGetStarted')?.addEventListener('click', () => {
    document.getElementById('authWelcome').style.display = 'none';
    document.getElementById('authRoleStep').style.display = 'block';
  });
  document.getElementById('btnAuthBn')?.addEventListener('click', () => setLanguage('bn'));
  document.getElementById('btnAuthEn')?.addEventListener('click', () => setLanguage('en'));
  document.querySelectorAll('.auth-role-option').forEach(button => button.addEventListener('click', () => {
    state.authRole = button.dataset.role;
    document.getElementById('authRoleStep').style.display = 'none';
    document.getElementById('authFormStep').style.display = 'block';
    document.getElementById('authFormTitle').textContent = state.authRole === 'SHOP_OWNER' ? uiKey('owner_account') : state.authRole === 'RIDER' ? uiKey('rider_account') : uiKey('customer_account');
    setAuthMode('login');
  }));
  document.getElementById('btnAuthBack')?.addEventListener('click', () => {
    document.getElementById('authFormStep').style.display = 'none';
    document.getElementById('authRoleStep').style.display = 'block';
  });
  document.getElementById('btnAuthLanguage')?.addEventListener('click', () => setLanguage(state.lang === 'en' ? 'bn' : 'en'));
  document.querySelectorAll('.auth-mode').forEach(button => button.addEventListener('click', () => setAuthMode(button.dataset.authMode)));
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    clearSession();
    state.activeCart.items = [];
    showLoginOverlay();
  });

  // Theme Toggle
  document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('kd_theme', state.theme);
    document.body.className = `theme-${state.theme}`;
    updateThemeIcon();
  });

  // Language Buttons
  document.getElementById('btnLangBn')?.addEventListener('click', () => setLanguage('bn'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => setLanguage('en'));

  // GPS Location Trigger
  document.getElementById('gpsBadge')?.addEventListener('click', () => {
    showToast(ui('Refreshing GPS coordinates from device...','ডিভাইস থেকে জিপিএস লোকেশন আপডেট করা হচ্ছে...'));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          state.userCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          document.getElementById('gpsCoordsText').textContent = `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
          updateMapUserLocation();
          fetchNearbyShops();
          showToast(ui('GPS location updated!','জিপিএস লোকেশন আপডেট হয়েছে!'));
        },
        err => {
          showToast(ui('Using default location: Dhaka Sector 3','ডিফল্ট লোকেশন ব্যবহার করা হচ্ছে: ঢাকা সেক্টর ৩'));
          fetchNearbyShops();
        }
      );
    }
  });

  // View Switcher (Customer / Owner / Database)
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (state.user?.role === 'SHOP_OWNER' && view !== 'owner') return;
      if (state.user?.role === 'USER' && view !== 'customer') return;
      if (state.user?.role === 'ADMIN' && view !== 'database') return;
      activateView(view);
    });
  });

  // Radius Selector Pills
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rad = parseInt(btn.getAttribute('data-radius'), 10);
      state.radius = rad;
      updateRadiusBoundary();
      fetchNearbyShops();
      showToast(state.lang==='bn' ? `অনুসন্ধানের দূরত্ব ${rad} মিটার করা হয়েছে` : `Search radius set to ${rad} meters`);
    });
  });

  // "Find Product Near Me" Live Search
  const searchInput = document.getElementById('productNearMeInput');
  const clearBtn = document.getElementById('btnClearSearch');

  let debounceTimer;
  searchInput?.addEventListener('input', e => {
    const val = e.target.value.trim();
    clearBtn.style.display = val ? 'block' : 'none';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (val.length >= 2) {
        searchProductNearMe(val);
      } else if (val.length === 0) {
        closeProductNearMeSearch();
      }
    }, 250);
  });

  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    closeProductNearMeSearch();
  });

  // Quick Chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      searchInput.value = q;
      clearBtn.style.display = 'block';
      searchProductNearMe(q);
    });
  });

  document.getElementById('btnCloseProductSearch')?.addEventListener('click', closeProductNearMeSearch);

  // Cart & Modals
  document.getElementById('btnOpenCart')?.addEventListener('click', openCartDrawer);
  document.getElementById('btnCloseCart')?.addEventListener('click', closeCartDrawer);
  document.getElementById('btnCloseStoreModal')?.addEventListener('click', closeStoreModal);
  document.getElementById('btnPlaceOrder')?.addEventListener('click', placeOrder);
  document.getElementById('btnCloseTrackingModal')?.addEventListener('click', () => {
    document.getElementById('orderTrackingModal').style.display = 'none';
  });
  document.querySelectorAll('.payment-method').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      state.selectedPaymentMethod = button.dataset.payment || 'CASH_ON_DELIVERY';
      const label = state.selectedPaymentMethod === 'CASH_ON_DELIVERY' ? 'Place Order (Cash on Delivery)' : `Place Order & Pay with ${state.selectedPaymentMethod}`;
      const span = document.querySelector('#btnPlaceOrder span');
      if (span) span.textContent = label;
    });
  });
  document.getElementById('btnOpenOrderChat')?.addEventListener('click', () => state.activeOrder && openOrderChat(state.activeOrder));
  document.getElementById('btnCloseOrderChat')?.addEventListener('click', closeOrderChat);
  document.getElementById('chatForm')?.addEventListener('submit', sendChatMessage);
  document.getElementById('btnContactShop')?.addEventListener('click', () => callOrderParty(state.activeOrder));


  // Customer Bottom Action Buttons
  document.getElementById('btnCustomerOrders')?.addEventListener('click', () => {
    openCustomerOrders();
  });

  document.getElementById('btnCustomerStats')?.addEventListener('click', () => {
    showToast(ui('Customer spending: ৳850 across 2 orders at Rahman Grocery','ক্রেতার খরচ: রহমান গ্রোসারিতে ২টি অর্ডারে ৳৮৫০'));
  });

  // Radio toggle for Delivery / Pickup
  document.querySelectorAll('input[name="orderType"]').forEach(radio => {
    radio.addEventListener('change', e => {
      document.querySelectorAll('.radio-label').forEach(lbl => lbl.classList.remove('active'));
      e.target.closest('.radio-label').classList.add('active');
      state.activeCart.deliveryFee = e.target.value === 'PICKUP' ? 0 : 20;
      updateCartDisplay();
    });
  });

  // Owner Portal Controls
  document.querySelectorAll('.owner-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.owner-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.owner-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'orders') document.getElementById('ownerTabOrders').classList.add('active');
      if (tab === 'inventory') document.getElementById('ownerTabInventory').classList.add('active');
      if (tab === 'analytics') document.getElementById('ownerTabAnalytics').classList.add('active');
    });
  });

  document.getElementById('btnToggleShopStatus')?.addEventListener('click', toggleShopStatus);
  document.getElementById('btnOpenAddProductModal')?.addEventListener('click', () => {
    document.getElementById('addProductModal').style.display = 'flex';
  });
  document.getElementById('btnCloseAddProductModal')?.addEventListener('click', () => {
    document.getElementById('addProductModal').style.display = 'none';
  });
  document.getElementById('formAddProduct')?.addEventListener('submit', handleAddProduct);

  // Database Inspector Controls
  document.getElementById('btnRefreshDbStats')?.addEventListener('click', loadDbInspector);
  document.getElementById('btnExecuteQuery')?.addEventListener('click', executeCustomDbQuery);
  document.getElementById('btnPresetGeoNear')?.addEventListener('click', () => {
    document.getElementById('dbQueryEditor').value = JSON.stringify([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [90.4125, 23.8103] },
          distanceField: "distanceMeters",
          maxDistance: 200,
          spherical: true
        }
      },
      {
        $project: { shopName: 1, distanceMeters: { $round: ["$distanceMeters", 1] }, open: 1, rating: 1 }
      }
    ], null, 2);
  });
  document.getElementById('btnPresetFindProducts')?.addEventListener('click', () => {
    document.getElementById('dbQueryEditor').value = JSON.stringify({ available: true, stock: { $gt: 0 } }, null, 2);
  });
  document.getElementById('btnPresetFindOrders')?.addEventListener('click', () => {
    document.getElementById('dbQueryEditor').value = JSON.stringify({ status: "DELIVERED" }, null, 2);
  });
}

function setAuthMode(mode) {
  state.authMode = mode;
  document.querySelectorAll('.auth-mode').forEach(button => button.classList.toggle('active', button.dataset.authMode === mode));
  const registering = mode === 'register';
  document.querySelectorAll('.register-only').forEach(field => {
    field.style.display = registering ? '' : 'none';
    field.querySelector('input')?.toggleAttribute('required', registering);
  });
  const loginIdentifier = document.getElementById('loginIdentifier');
  loginIdentifier.closest('.form-group').style.display = registering ? 'none' : '';
  loginIdentifier.required = !registering;
  document.getElementById('loginPassword').required = true;
  document.getElementById('authSubmitButton').innerHTML = mode === 'register' ? `<i class="fa-solid fa-user-plus"></i> ${ui('Create account','অ্যাকাউন্ট তৈরি করুন')}` : `<i class="fa-solid fa-right-to-bracket"></i> ${uiKey('login')}`;
  document.getElementById('authDemoHint').style.display = mode === 'register' ? 'none' : '';
}

// Leaflet Map Initialization
function initLeafletMap() {
  const mapElement = document.getElementById('hyperlocalMap');
  if (!mapElement) return;
  if (typeof window.L === 'undefined') {
    showMapUnavailableState();
    return;
  }

  state.map = window.L.map('hyperlocalMap', {
    zoomControl: true,
    attributionControl: false
  }).setView([state.userCoords.latitude, state.userCoords.longitude], 17);

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(state.map);

  updateMapUserLocation();
}

function showMapUnavailableState() {
  const mapElement = document.getElementById('hyperlocalMap');
  if (!mapElement || state.map) return;
  mapElement.innerHTML = `<div class="map-unavailable-state"><i class="fa-solid fa-map-location-dot"></i><strong>${ui('Map temporarily unavailable','ম্যাপ সাময়িকভাবে পাওয়া যাচ্ছে না')}</strong><span>${ui('Shopping, orders and all other features still work.','কেনাকাটা, অর্ডার ও অন্যান্য সব সুবিধা চালু আছে।')}</span></div>`;
}

function updateMapUserLocation() {
  if (!state.map) return;

  // Clear previous user marker & radius
  if (state.userMarker) state.map.removeLayer(state.userMarker);
  if (state.radiusCircle) state.map.removeLayer(state.radiusCircle);

  // User Marker
  if (typeof window.L === 'undefined') return;
  const userIcon = window.L.divIcon({
    className: 'custom-user-marker-container',
    html: `<div class="custom-user-marker" title="You are here"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  state.userMarker = window.L.marker([state.userCoords.latitude, state.userCoords.longitude], { icon: userIcon })
    .addTo(state.map)
    .bindPopup('<b>📍 Your Current Location</b><br>Searching within ' + state.radius + ' meters');

  // Radius Circle
  state.radiusCircle = window.L.circle([state.userCoords.latitude, state.userCoords.longitude], {
    radius: state.radius,
    color: '#2563EB',
    fillColor: '#3B82F6',
    fillOpacity: 0.12,
    weight: 2,
    dashArray: '4, 6'
  }).addTo(state.map);

  state.map.setView([state.userCoords.latitude, state.userCoords.longitude], state.radius <= 200 ? 18 : 16);
}

function updateRadiusBoundary() {
  if (state.radiusCircle) {
    state.radiusCircle.setRadius(state.radius);
    if (state.map) {
      state.map.setView([state.userCoords.latitude, state.userCoords.longitude], state.radius <= 200 ? 18 : 16);
    }
  }
}

// Fetch Nearby Shops from MongoDB Backend API
async function fetchNearbyShops() {
  const statusEl = document.getElementById('shopsFoundCount');
  if (statusEl) statusEl.textContent = ui('Querying database for nearby shops...','কাছের দোকানের জন্য ডাটাবেজে অনুসন্ধান চলছে...');

  try {
    const res = await fetch(`/api/shops/nearby?lat=${state.userCoords.latitude}&lng=${state.userCoords.longitude}&radius=${state.radius}`);
    const data = await res.json();

    if (data.success) {
      state.shops = data.data;
      renderShopsList(data.data);
      renderMapShopMarkers(data.data);

      if (statusEl) statusEl.textContent = state.lang==='bn' ? `${data.count}টি দোকান ${state.radius} মিটারের মধ্যে` : `${data.count} shops within ${state.radius}m`;
      const badge = document.getElementById('nearbyCountBadge');
      if (badge) badge.textContent = `${data.count} ${uiKey(data.count === 1 ? 'shop_word' : 'shops_word')}`;

      const subtitle = document.getElementById('shopsRadiusSubtitle');
      if (subtitle) {
        subtitle.textContent = state.lang === 'bn' 
          ? `${state.radius} মিটারের মধ্যে • দূরত্ব অনুযায়ী সাজানো`
          : `Within ${state.radius} meters • Sorted nearest first`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch nearby shops:', err);
    if (statusEl) statusEl.textContent = ui('Connection error. Check the backend.','সংযোগে সমস্যা হয়েছে। ব্যাকএন্ড পরীক্ষা করুন।');
  }
}

// Render Shop Markers on Leaflet Map
function renderMapShopMarkers(shops) {
  if (!state.map) return;

  // Remove existing markers
  state.mapMarkers.forEach(m => state.map.removeLayer(m));
  state.mapMarkers = [];

  shops.forEach(shop => {
    const lat = shop.location.coordinates[1];
    const lng = shop.location.coordinates[0];

    const shopIcon = L.divIcon({
      className: 'custom-shop-marker-wrap',
      html: `
        <div class="custom-shop-marker ${shop.open ? 'open' : 'closed'}">
          <span>🏪</span>
          <span>${shop.distanceMeters}m</span>
        </div>
      `,
      iconSize: [60, 24],
      iconAnchor: [30, 12]
    });

    const marker = L.marker([lat, lng], { icon: shopIcon }).addTo(state.map);
    
    marker.on('click', () => {
      openStoreModal(shop._id);
    });

    marker.bindPopup(`
      <div style="font-family: Outfit, sans-serif;">
        <h4 style="margin: 0 0 4px 0; font-size: 1rem; color: #10B981;">${shop.shopName}</h4>
        <p style="margin: 0 0 4px 0; font-size: 0.8rem; color: #64748B;">📍 ${shop.distanceMeters}m away</p>
        <p style="margin: 0 0 8px 0; font-size: 0.8rem;">⭐ ${shop.rating} • ${shop.open ? '🟢 Open' : '🔴 Closed'}</p>
        <button onclick="window.appOpenStoreModal('${shop._id}')" style="background: #10B981; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%;">
          View Products
        </button>
      </div>
    `);

    state.mapMarkers.push(marker);
  });
}

// Render Shop Cards in Right Column
function renderShopsList(shops) {
  const container = document.getElementById('shopsListContainer');
  if (!container) return;

  if (!shops || !shops.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-shop-slash" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h4>${state.lang === 'bn' ? 'কোন দোকান পাওয়া যায়নি' : 'No Grocery Shops Found'}</h4>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">
          ${state.lang === 'bn' ? 'অনুসন্ধানের এরিয়া বাড়িয়ে ৫০০ মিটার বা ১ কি.মি. নির্বাচন করুন।' : 'Try expanding your search radius to 500m or 1km.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = shops.map(shop => {
    const displayName = state.lang === 'bn' && shop.shopNameBn ? shop.shopNameBn : shop.shopName;
    return `
      <div class="shop-card" onclick="window.appOpenStoreModal('${shop._id}')">
        <img src="${shop.ownerImageUrl || shop.imageUrl}" alt="${displayName}" class="shop-card-img">
        <div class="shop-card-body">
          <div class="shop-title-row">
            <h4 class="shop-name">${displayName}</h4>
            <span class="distance-tag">
              <i class="fa-solid fa-location-arrow"></i> ${shop.distanceMeters}m
            </span>
          </div>
          <p class="shop-address">${shop.address}</p>
          <div class="shop-meta-row">
            <span class="meta-rating">⭐ ${shop.rating} (${shop.totalRatings || 50})</span>
            <span class="status-badge ${shop.open ? 'open' : 'closed'}">
              ${shop.open ? '🟢 ' + (state.lang === 'bn' ? 'খোলা' : 'Open') : '🔴 ' + (state.lang === 'bn' ? 'বন্ধ' : 'Closed')}
            </span>
            <span class="text-muted">
              ${shop.deliveryAvailable ? `🚚 ৳20 ${uiKey('delivery_short')}` : `🏪 ${uiKey('pickup_only')}`}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// "Find Product Near Me" Engine
async function searchProductNearMe(query) {
  const panel = document.getElementById('productNearMePanel');
  const defaultPanel = document.getElementById('shopsListPanel');
  const resultsContainer = document.getElementById('nearMeResultsList');
  const summaryEl = document.getElementById('searchQuerySummary');

  panel.style.display = 'block';
  defaultPanel.style.display = 'none';

  summaryEl.textContent = state.lang === 'bn' 
    ? `"${query}" এর জন্য কাছের দোকানে প্রাপ্ত ফলাফল:`
    : `Showing matching products near you for "${query}":`;

  resultsContainer.innerHTML = `<div style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin"></i> ${uiKey('searching_shops')}</div>`;

  try {
    const res = await fetch(`/api/products/search-near-me?query=${encodeURIComponent(query)}&lat=${state.userCoords.latitude}&lng=${state.userCoords.longitude}&radius=1000`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      resultsContainer.innerHTML = data.data.map(item => {
        const prodName = state.lang === 'bn' && item.productNameBn ? item.productNameBn : item.productName;
        const shopName = state.lang === 'bn' && item.shopNameBn ? item.shopNameBn : item.shopName;
        const isOutOfStock = item.stock <= 0 || !item.available;

        return `
          <div class="near-me-product-card">
            <img src="${item.imageUrl}" alt="${prodName}" class="product-thumb">
            <div class="product-info-wrap">
              <div>
                <div class="product-title-row">
                  <h4 class="product-title">${prodName}</h4>
                  <span class="distance-tag">
                    <i class="fa-solid fa-location-arrow"></i> ${item.distanceMeters}m
                  </span>
                </div>
                <span class="product-unit">${item.unit}</span>
                <div class="product-store-info">
                  <span>🏪 <strong>${shopName}</strong></span>
                  <span>•</span>
                  <span>⭐ ${item.shopRating || 4.7}</span>
                </div>
              </div>
              <div class="product-price-action">
                <div>
                  <span class="product-price">৳${item.price}</span>
                  <span class="badge ${isOutOfStock ? 'badge-danger' : 'badge-success'}" style="margin-left: 0.5rem;">
                    ${isOutOfStock ? (state.lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock') : (state.lang === 'bn' ? 'স্টকে আছে (' + item.stock + ')' : 'In Stock (' + item.stock + ')')}
                  </span>
                </div>
                <button 
                  class="btn btn-sm btn-primary" 
                  ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                  onclick="window.appAddToCart('${item.shopId}', '${shopName}', '${item.productId}', '${prodName}', ${item.price}, '${item.unit}', ${item.stock})"
                >
                  <i class="fa-solid fa-plus"></i> ${state.lang === 'bn' ? 'কার্টে যোগ' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--accent-orange);"></i>
          <h4>${state.lang === 'bn' ? 'কাছের কোন দোকানে এই পণ্য পাওয়া যায়নি' : 'Product Not Found in Nearby Shops'}</h4>
          <p style="font-size: 0.82rem; margin-top: 0.4rem;">
            ${state.lang === 'bn' ? 'অন্য কোন নাম লিখে চেষ্টা করুন বা সার্চ রেডিয়াস বাড়ান।' : 'Try searching another keyword or ask your nearby shop to stock it.'}
          </p>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error searching near me:', err);
    resultsContainer.innerHTML = `<div style="color: var(--danger); padding: 1rem;">${uiKey('search_failed')}</div>`;
  }
}

function closeProductNearMeSearch() {
  document.getElementById('productNearMePanel').style.display = 'none';
  document.getElementById('shopsListPanel').style.display = 'block';
  document.getElementById('productNearMeInput').value = '';
  document.getElementById('btnClearSearch').style.display = 'none';
}

// Store Details Modal & Product Browsing
async function openStoreModal(shopId) {
  try {
    const shopRes = await fetch(`/api/shops/${shopId}`);
    const shopData = await shopRes.json();

    const prodRes = await fetch(`/api/shops/${shopId}/products`);
    const prodData = await prodRes.json();

    if (shopData.success) {
      state.selectedShop = shopData.data;
      const shop = shopData.data;

      document.getElementById('modalShopName').textContent = state.lang === 'bn' && shop.shopNameBn ? shop.shopNameBn : shop.shopName;
      document.getElementById('modalShopAddress').textContent = shop.address;
      document.getElementById('modalShopRating').textContent = `⭐ ${shop.rating} (${shop.totalRatings || 50} ${uiKey('reviews')})`;
      document.getElementById('modalShopHours').textContent = `🕒 ${shop.openingTime} - ${shop.closingTime}`;
      document.getElementById('modalShopDelivery').textContent = shop.deliveryAvailable ? `🚚 ৳20 ${uiKey('delivery_short')}` : `🏪 ${uiKey('pickup_only')}`;

      renderStoreProducts(prodData.data || [], shop);
      document.getElementById('storeModal').style.display = 'flex';
    }
  } catch (err) {
    console.error('Failed to load store modal:', err);
    showToast(ui('Failed to load shop details','দোকানের তথ্য লোড করা যায়নি'));
  }
}

function renderStoreProducts(products, shop) {
  const grid = document.getElementById('modalProductsGrid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">${ui('No products currently available in this store.','এই দোকানে বর্তমানে কোনো পণ্য পাওয়া যাচ্ছে না।')}</div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const isOutOfStock = p.stock <= 0 || !p.available;
    const name = state.lang === 'bn' && p.nameBn ? p.nameBn : p.name;

    return `
      <div class="product-card">
        <img src="${p.imageUrl}" alt="${name}" class="product-img">
        <div class="product-details">
          <div>
            <h5 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${name}</h5>
            ${p.brand ? `<span style="display:block;font-size:.72rem;color:var(--primary);font-weight:700;">${escapeHtml(p.brand)}</span>` : ''}
            <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(p.unit || '')}</span>
            ${p.description ? `<span style="display:block;font-size:.7rem;color:var(--text-muted);margin-top:2px;">${escapeHtml(p.description)}</span>` : ''}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
            <div>
              <strong style="color: var(--primary); font-size: 1.05rem;">৳${p.price}</strong>
              <div style="font-size: 0.7rem; color: ${isOutOfStock ? 'var(--danger)' : 'var(--text-muted)'};">
                ${isOutOfStock ? 'Out of stock' : 'Stock: ' + p.stock}
              </div>
            </div>
            <button 
              class="btn btn-sm btn-primary" 
              ${isOutOfStock ? 'disabled style="opacity: 0.5;"' : ''}
              onclick="window.appAddToCart('${shop._id}', '${shop.shopName}', '${p._id}', '${name}', ${p.price}, '${p.unit}', ${p.stock})"
            >
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function closeStoreModal() {
  document.getElementById('storeModal').style.display = 'none';
}

// Cart & Ordering
function addToCart(shopId, shopName, productId, productName, unitPrice, unit, stock, shopDeliveryFee = 20) {
  const existing = state.activeCart.items.find(i => String(i.productId) === String(productId));
  if (existing) {
    if (existing.quantity < stock) existing.quantity += 1;
    else { showToast(state.lang==='bn' ? `সর্বোচ্চ উপলভ্য স্টক ${stock}` : `Maximum available stock reached (${stock})`); return; }
  } else {
    state.activeCart.items.push({
      shopId: String(shopId), shopName: shopName || 'Shop', shopDeliveryFee: Number(shopDeliveryFee) || 20,
      productId: String(productId), productName, unitPrice: Number(unitPrice), unit, quantity: 1, maxStock: Number(stock)
    });
  }
  const shopIds = [...new Set(state.activeCart.items.map(i => String(i.shopId)))];
  state.activeCart.shopId = shopIds.length === 1 ? shopIds[0] : null;
  state.activeCart.shopName = shopIds.length === 1 ? state.activeCart.items[0]?.shopName || '' : `${shopIds.length} shops`;
  updateCartDisplay();
  showToast(state.lang==='bn' ? `"${productName}" কার্টে যোগ হয়েছে!` : `Added "${productName}" to cart!`);
}

function getCartShopGroups() {
  const groups = new Map();
  for (const item of state.activeCart.items) {
    const key = String(item.shopId || '');
    if (!groups.has(key)) groups.set(key, { shopId:key, shopName:item.shopName || 'Shop', deliveryFee:Number(item.shopDeliveryFee) || 20, items:[] });
    groups.get(key).items.push(item);
  }
  return [...groups.values()];
}

function updateCartDisplay() {
  const countBadge = document.getElementById('cartCountBadge');
  const shopNameEl = document.getElementById('cartShopName');
  const itemsContainer = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const deliveryEl = document.getElementById('cartDeliveryFee');
  const totalEl = document.getElementById('cartTotal');
  const groups = getCartShopGroups();
  const totalItemsCount = state.activeCart.items.reduce((acc,i)=>acc+i.quantity,0);
  if (countBadge) countBadge.textContent = totalItemsCount;
  if (shopNameEl) {
    if (!groups.length) shopNameEl.textContent=uiKey('cart_empty');
    else if (groups.length===1) shopNameEl.textContent=state.lang==='bn' ? `দোকান: ${groups[0].shopName}` : `From: ${groups[0].shopName}`;
    else shopNameEl.textContent=state.lang==='bn' ? `${groups.length}টি দোকান • আলাদা ডেলিভারি` : `From ${groups.length} shops • separate deliveries`;
  }
  let subtotal=0; state.activeCart.items.forEach(i=>subtotal += i.unitPrice*i.quantity);
  const orderType=document.querySelector('input[name="orderType"]:checked')?.value || 'DELIVERY';
  const deliveryFee=orderType==='PICKUP'?0:groups.reduce((sum,g)=>sum+g.deliveryFee,0);
  state.activeCart.subtotal=subtotal; state.activeCart.deliveryFee=deliveryFee; state.activeCart.total=subtotal>0?subtotal+deliveryFee:0;
  if(subtotalEl) subtotalEl.textContent=`৳${subtotal}`;
  if(deliveryEl) deliveryEl.textContent=`৳${deliveryFee}${groups.length>1&&orderType!=='PICKUP'?` (${groups.length} shops)`:''}`;
  if(totalEl) totalEl.textContent=`৳${state.activeCart.total}`;
  if(!itemsContainer) return;
  if(!state.activeCart.items.length){
    itemsContainer.innerHTML=`<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);"><i class="fa-solid fa-basket-shopping" style="font-size:2.5rem;margin-bottom:.75rem;opacity:.4;"></i><h4>${uiKey('cart_empty')}</h4><p style="font-size:.8rem;margin-top:.25rem;">${uiKey('cart_empty_help')}</p></div>`;
    const btn=document.getElementById('btnPlaceOrder'); if(btn) btn.disabled=true; return;
  }
  const btn=document.getElementById('btnPlaceOrder'); if(btn) btn.disabled=false;
  itemsContainer.innerHTML=groups.map(group=>`<div class="multi-shop-cart-group" style="margin-bottom:1rem;border:1px solid var(--border-color);border-radius:12px;overflow:hidden;"><div style="padding:.65rem .8rem;background:var(--bg-app);font-weight:800;display:flex;justify-content:space-between;gap:.5rem;"><span><i class="fa-solid fa-store"></i> ${escapeHtml(group.shopName)}</span><span style="font-size:.78rem;color:var(--text-muted);">${orderType==='PICKUP'?'Pickup':`Delivery ৳${group.deliveryFee}`}</span></div><div style="padding:.35rem .7rem;">${group.items.map(item=>`<div class="cart-item-row"><div class="cart-item-info"><h5>${escapeHtml(item.productName)}</h5><p>${escapeHtml(item.unit||'')} • ৳${item.unitPrice} each</p></div><div style="display:flex;align-items:center;gap:.75rem;"><div class="cart-stepper"><button class="stepper-btn" onclick="window.appUpdateCartQty('${item.productId}', -1)">-</button><span style="font-size:.85rem;font-weight:700;min-width:18px;text-align:center;">${item.quantity}</span><button class="stepper-btn" onclick="window.appUpdateCartQty('${item.productId}', 1)">+</button></div><strong style="color:var(--primary);font-size:.95rem;min-width:50px;text-align:right;">৳${item.unitPrice*item.quantity}</strong></div></div>`).join('')}</div></div>`).join('');
}

function updateCartQuantity(productId, delta) {
  const item=state.activeCart.items.find(i=>String(i.productId)===String(productId)); if(!item)return;
  item.quantity+=delta;
  if(item.quantity<=0) state.activeCart.items=state.activeCart.items.filter(i=>String(i.productId)!==String(productId));
  else if(item.quantity>item.maxStock){ item.quantity=item.maxStock; showToast(state.lang==='bn' ? `স্টকে শুধু ${item.maxStock}টি আছে` : `Only ${item.maxStock} in stock`); }
  const groups=getCartShopGroups(); state.activeCart.shopId=groups.length===1?groups[0].shopId:null; state.activeCart.shopName=groups.length===1?groups[0].shopName:(groups.length?`${groups.length} shops`:'');
  updateCartDisplay();
}

function openCartDrawer(){ document.getElementById('cartDrawer').style.display='flex'; updateCartDisplay(); }
function closeCartDrawer(){ document.getElementById('cartDrawer').style.display='none'; }

async function placeOrder(){
  if(!state.activeCart.items.length){ showToast(ui('Cart is empty!','কার্ট খালি!')); return; }
  const groups=getCartShopGroups();
  const orderType=document.querySelector('input[name="orderType"]:checked')?.value || 'DELIVERY';
  const deliveryAddress=document.getElementById('checkoutAddress')?.value || 'Uttara Sector 3, Dhaka';
  const customerPhone=document.getElementById('checkoutPhone')?.value || '01711000001';
  const checkoutPayload={groups:groups.map(group=>({shopId:group.shopId,items:group.items.map(i=>({productId:i.productId,productName:i.productName,unit:i.unit,price:i.unitPrice,quantity:i.quantity}))})),orderType,deliveryAddress,customerPhone,paymentMethod:state.selectedPaymentMethod};
  try{
    const res=await apiFetch('/api/orders/multi-store',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(checkoutPayload)}); const data=await res.json();
    if(!data.success){ showToast(state.lang==='bn' ? `ব্যর্থ: ${data.message||'অর্ডার করা যায়নি।'}` : `Failed: ${data.message||'Unable to place orders.'}`); return; }
    let createdOrders=data.data?.orders || [];
    if(state.selectedPaymentMethod!=='CASH_ON_DELIVERY'){
      const paid=[]; for(const order of createdOrders) paid.push(await processSelectedPayment(order,state.selectedPaymentMethod)); createdOrders=paid;
    }
    state.activeOrders=createdOrders; state.activeOrder=createdOrders[0]||null;
    showToast(createdOrders.length>1 ? (state.lang==='bn' ? `🎉 ${createdOrders.length}টি আলাদা দোকানের অর্ডার সফল হয়েছে!` : `🎉 ${createdOrders.length} separate shop orders placed successfully!`) : ui('🎉 Order placed successfully!','🎉 অর্ডার সফলভাবে করা হয়েছে!'));
    state.activeCart={shopId:null,shopName:'',items:[],subtotal:0,deliveryFee:20,total:0}; updateCartDisplay(); closeCartDrawer(); closeStoreModal();
    if(createdOrders.length>1) openCustomerOrders(createdOrders); else if(createdOrders[0]) showOrderTracking(createdOrders[0]);
  }catch(err){ console.error('Multi-store order placement error:',err); showToast(ui('Error communicating with backend','ব্যাকএন্ডের সাথে যোগাযোগে সমস্যা হয়েছে')); }
}

function ensureCustomerOrdersModal(){
  let modal=document.getElementById('customerOrdersModal'); if(modal)return modal;
  modal=document.createElement('div'); modal.id='customerOrdersModal'; modal.className='modal-overlay'; modal.style.display='none';
  modal.innerHTML=`<div class="modal-card" style="max-width:760px;width:min(94vw,760px);max-height:88vh;overflow:auto;"><div class="modal-header" style="position:sticky;top:0;background:var(--bg-card);z-index:2;"><div><h3 style="margin:0"><i class="fa-solid fa-boxes-stacked"></i> My Orders</h3><p style="margin:.2rem 0 0;color:var(--text-muted);font-size:.8rem">Each shop has separate tracking, rider, chat and pickup code.</p></div><button class="modal-close-btn" onclick="document.getElementById('customerOrdersModal').style.display='none'">&times;</button></div><div id="customerOrdersList" style="padding:1rem;"></div></div>`;
  document.body.appendChild(modal); return modal;
}

function renderCustomerOrdersList(orders){
  const list=document.getElementById('customerOrdersList'); if(!list)return;
  if(!orders?.length){ list.innerHTML=`<div class="empty-state-small">${uiKey('no_orders')}</div>`; return; }
  list.innerHTML=orders.map(order=>`<div style="border:1px solid var(--border-color);border-radius:14px;padding:.9rem;margin-bottom:.8rem;background:var(--bg-card);"><div style="display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;"><div><div style="font-weight:800">${escapeHtml(order.shopNameBn||order.shopName||'Shop')}</div><div style="font-size:.76rem;color:var(--text-muted)">Order #${escapeHtml(order.orderNumber||'')}</div></div><span class="badge badge-primary">${escapeHtml(order.status||'PLACED')}</span></div><div style="margin:.65rem 0;font-size:.84rem">${(order.items||[]).map(i=>`<div>• ${escapeHtml(i.productName)} × ${i.quantity} — ৳${Number(i.price)*Number(i.quantity)}</div>`).join('')}</div><div style="display:flex;justify-content:space-between;gap:.7rem;align-items:center;flex-wrap:wrap"><strong>৳${order.totalPrice}</strong><div style="display:flex;gap:.45rem;flex-wrap:wrap"><button class="btn btn-sm btn-outline" onclick="window.kdTrackCustomerOrder('${order._id}')"><i class="fa-solid fa-location-dot"></i> Track</button><button class="btn btn-sm btn-outline" onclick="window.appOpenOrderChatById('${order._id}','${escapeHtml(order.orderNumber||'')}')"><i class="fa-solid fa-message"></i> Chat</button></div></div></div>`).join('');
}

async function openCustomerOrders(prefetchedOrders=null){
  ensureCustomerOrdersModal(); const modal=document.getElementById('customerOrdersModal'); const list=document.getElementById('customerOrdersList'); modal.style.display='flex'; list.innerHTML='<div class="empty-state-small">Loading orders…</div>';
  try{ let orders=prefetchedOrders; if(!orders){ const res=await apiFetch('/api/orders'); const data=await res.json(); if(!data.success)throw new Error(data.message||'Unable to load orders.'); orders=data.data||[]; } state.activeOrders=orders; renderCustomerOrdersList(orders); }
  catch(err){ list.innerHTML=`<div class="empty-state-small">${escapeHtml(err.message||'Unable to load orders.')}</div>`; }
}
function kdTrackCustomerOrder(orderId){ const order=(state.activeOrders||[]).find(o=>String(o._id)===String(orderId)); if(!order)return showToast(ui('Order details are not loaded.','অর্ডারের তথ্য এখনও লোড হয়নি।')); document.getElementById('customerOrdersModal').style.display='none'; showOrderTracking(order); }
window.kdTrackCustomerOrder=kdTrackCustomerOrder; window.openCustomerOrders=openCustomerOrders;

// Live Order Tracking Stepper
function showOrderTracking(order) {
  state.activeOrder = order;
  joinRealtimeOrder(order);
  loadOrderContact(order);
  if (trackingRefreshTimer) clearInterval(trackingRefreshTimer);
  trackingRefreshTimer = setInterval(refreshTrackedOrder, 8000);
  document.getElementById('trackOrderNumber').textContent = `${uiKey('order_word')} #${order.orderNumber}`;
  document.getElementById('trackShopName').textContent = order.shopName;

  const steps = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIdx = steps.indexOf(order.status);

  const stepElements = {
    PLACED: document.getElementById('stepPlaced'),
    ACCEPTED: document.getElementById('stepAccepted'),
    PREPARING: document.getElementById('stepPreparing'),
    READY: document.getElementById('stepReady'),
    OUT_FOR_DELIVERY: document.getElementById('stepDelivery'),
    DELIVERED: document.getElementById('stepDelivered')
  };

  steps.forEach((st, idx) => {
    const el = stepElements[st];
    if (el) {
      el.classList.remove('completed', 'active');
      if (idx < currentIdx) el.classList.add('completed');
      if (idx === currentIdx) el.classList.add('active');
    }
  });

  const summary = document.getElementById('trackItemsSummary');
  if (summary && order.items) {
    summary.innerHTML = `
      <div style="background: var(--bg-app); padding: 0.85rem; border-radius: var(--radius-md); font-size: 0.85rem;">
        <div style="font-weight: 700; margin-bottom: 0.4rem;">Order Summary:</div>
        ${order.items.map(i => `<div>• ${i.productName} (${i.unit}) × ${i.quantity} — <strong>৳${i.price * i.quantity}</strong></div>`).join('')}
        <div style="border-top: 1px solid var(--border-color); margin-top: 0.4rem; padding-top: 0.4rem; font-weight: 700; color: var(--primary);">
          Total: ৳${order.totalPrice} <span class="payment-status-chip">${order.paymentMethod || 'CASH_ON_DELIVERY'} · ${order.paymentStatus || 'PENDING'}</span>
        </div>
      </div>
    `;
  }

  document.getElementById('orderTrackingModal').style.display = 'flex';
}


async function processSelectedPayment(order, method) {
  try {
    const res = await apiFetch('/api/payments/initiate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order._id, method })
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message || ui('Payment setup is not available yet. Order remains unpaid.','পেমেন্ট ব্যবস্থা এখনো প্রস্তুত নয়। অর্ডারটি অপরিশোধিত থাকবে।'));
      return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
    }
    if (data.demo) {
      const ok = window.confirm(state.lang==='bn' ? `${method} পরীক্ষামূলক পেমেন্ট\n\nপরিমাণ: ৳${order.totalPrice}\n\nসফল পরীক্ষামূলক পেমেন্ট নিশ্চিত করতে OK চাপুন।` : `${method} DEMO PAYMENT\n\nAmount: ৳${order.totalPrice}\n\nPress OK to simulate a successful provider payment.`);
      if (ok) {
        const confirmRes = await apiFetch(`/api/payments/${data.data._id}/demo-confirm`, { method: 'POST' });
        const confirmed = await confirmRes.json();
        if (confirmed.success) {
          showToast(state.lang==='bn' ? `✅ ${method} পরীক্ষামূলক পেমেন্ট সফল` : `✅ ${method} demo payment successful`);
          return confirmed.data;
        }
      }
    }
  } catch (err) {
    console.error('Payment error:', err);
    showToast(ui('Order placed, but payment could not be completed.','অর্ডার হয়েছে, কিন্তু পেমেন্ট সম্পন্ন হয়নি।'));
  }
  return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
}

function joinRealtimeOrder(order) {
  if (!realtimeSocket || !order?._id || !state.authToken) return;
  realtimeSocket.emit('order:join', { orderId: order._id, token: state.authToken });
}

async function refreshTrackedOrder() {
  if (!state.activeOrder?._id) return;
  try {
    const res = await apiFetch('/api/orders');
    const data = await res.json();
    const latest = data.data?.find(o => o._id === state.activeOrder._id);
    if (latest) {
      state.activeOrder = latest;
      if (document.getElementById('orderTrackingModal')?.style.display !== 'none') showOrderTrackingWithoutTimer(latest);
    }
  } catch (err) {}
}

function showOrderTrackingWithoutTimer(order) {
  document.getElementById('trackOrderNumber').textContent = `${uiKey('order_word')} #${order.orderNumber}`;
  document.getElementById('trackShopName').textContent = order.shopName;
  const steps = ['PLACED','ACCEPTED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED'];
  const currentIdx = steps.indexOf(order.status);
  const ids = {PLACED:'stepPlaced',ACCEPTED:'stepAccepted',PREPARING:'stepPreparing',READY:'stepReady',OUT_FOR_DELIVERY:'stepDelivery',DELIVERED:'stepDelivered'};
  steps.forEach((st,idx)=>{ const el=document.getElementById(ids[st]); if(!el)return; el.classList.remove('completed','active'); if(idx<currentIdx)el.classList.add('completed'); if(idx===currentIdx)el.classList.add('active'); });
  const summary=document.getElementById('trackItemsSummary');
  if(summary) summary.innerHTML=`<div style="background:var(--bg-app);padding:.85rem;border-radius:var(--radius-md);font-size:.85rem"><div style="font-weight:700;margin-bottom:.4rem">Order Summary:</div>${(order.items||[]).map(i=>`<div>• ${i.productName} (${i.unit}) × ${i.quantity} — <strong>৳${i.price*i.quantity}</strong></div>`).join('')}<div style="border-top:1px solid var(--border-color);margin-top:.4rem;padding-top:.4rem;font-weight:700;color:var(--primary)">Total: ৳${order.totalPrice} <span class="payment-status-chip">${order.paymentMethod||'CASH_ON_DELIVERY'} · ${order.paymentStatus||'PENDING'}</span></div></div>`;
}

async function loadOrderContact(order) {
  if (!order?._id) return;
  try {
    const res = await apiFetch(`/api/orders/${order._id}/contact`);
    const data = await res.json();
    if (data.success) {
      state.orderContact = data.data;
      const isOwner = state.user?.role === 'SHOP_OWNER';
      const target = isOwner ? data.data.customer : data.data.shop;
      const btn = document.getElementById('btnContactShop');
      if (btn) btn.innerHTML = `<i class="fa-solid fa-phone"></i> ${isOwner ? uiKey('call_customer') : uiKey('call_shop_short')}${target.phone ? `: ${target.phone}` : ''}`;
    }
  } catch (err) {}
}

function callOrderParty(order) {
  if (!order) return;
  const isOwner = state.user?.role === 'SHOP_OWNER';
  const phone = isOwner ? state.orderContact?.customer?.phone : state.orderContact?.shop?.phone;
  if (!phone) return showToast(ui('Phone number is not available yet.','ফোন নম্বর এখনো পাওয়া যায়নি।'));
  window.location.href = `tel:${String(phone).replace(/\s+/g,'')}`;
}

async function callOrderPartyById(orderId) {
  try {
    const res=await apiFetch(`/api/orders/${orderId}/contact`); const data=await res.json();
    if(!data.success) throw new Error(data.message);
    const phone=state.user?.role==='SHOP_OWNER'?data.data.customer.phone:data.data.shop.phone;
    if(phone) window.location.href=`tel:${String(phone).replace(/\s+/g,'')}`; else showToast(ui('Phone number unavailable.','ফোন নম্বর পাওয়া যায়নি।'));
  } catch(err){ showToast(ui('Unable to load contact.','যোগাযোগের তথ্য লোড করা যায়নি।')); }
}

async function openOrderChat(order) {
  if (!order?._id) return;
  state.chatOrderId = order._id;
  document.getElementById('chatOrderBadge').textContent = `${uiKey('order_word')} #${order.orderNumber || order._id}`;
  document.getElementById('orderChatModal').style.display = 'flex';
  joinRealtimeOrder(order);
  await loadChatMessages(order._id);
}

async function openOrderChatById(orderId, orderNumber='') {
  state.chatOrderId=orderId;
  document.getElementById('chatOrderBadge').textContent=`${uiKey('order_word')} #${orderNumber||orderId}`;
  document.getElementById('orderChatModal').style.display='flex';
  joinRealtimeOrder({_id:orderId});
  await loadChatMessages(orderId);
}

function closeOrderChat() {
  document.getElementById('orderChatModal').style.display = 'none';
  state.chatOrderId = null;
}

async function loadChatMessages(orderId) {
  const box = document.getElementById('chatMessages');
  box.innerHTML = `<div class="chat-empty">${uiKey('loading_conversation')}</div>`;
  try {
    const res = await apiFetch(`/api/orders/${orderId}/messages`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    renderChatMessages(data.data || []);
  } catch (err) {
    box.innerHTML = `<div class="chat-empty">${err.message || 'Unable to load chat.'}</div>`;
  }
}

function renderChatMessages(messages) {
  const box=document.getElementById('chatMessages');
  if(!messages.length){ box.innerHTML=`<div class="chat-empty">${uiKey('no_messages')}</div>`; return; }
  box.innerHTML=messages.map(m=>`<div class="chat-bubble ${String(m.senderId)===String(state.user?._id)?'mine':''}"><div class="chat-meta">${escapeHtml(m.senderName||m.senderRole)} · ${new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div><div class="chat-text">${escapeHtml(m.text)}</div></div>`).join('');
  box.scrollTop=box.scrollHeight;
}

async function sendChatMessage(event) {
  event.preventDefault();
  const input=document.getElementById('chatInput'); const text=input.value.trim();
  if(!text||!state.chatOrderId)return;
  input.value='';
  try { const res=await apiFetch(`/api/orders/${state.chatOrderId}/messages`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})}); const data=await res.json(); if(!data.success)throw new Error(data.message); await loadChatMessages(state.chatOrderId); } catch(err){ showToast(err.message||ui('Message not sent.','বার্তা পাঠানো যায়নি।')); }
}

function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

if (realtimeSocket) {
  realtimeSocket.on('order:status', order => { if(state.activeOrder?._id===order._id){ state.activeOrder=order; showOrderTrackingWithoutTimer(order); } if(state.user?.role==='SHOP_OWNER') loadOwnerOrders(); });
  realtimeSocket.on('payment:updated', update => { if(state.activeOrder?._id===update.orderId){ state.activeOrder={...state.activeOrder,paymentStatus:update.paymentStatus,paymentMethod:update.method}; showOrderTrackingWithoutTimer(state.activeOrder); } });
  realtimeSocket.on('chat:message', message => { if(state.chatOrderId===String(message.orderId) || state.chatOrderId===message.orderId){ loadChatMessages(state.chatOrderId); } });
}

// Shop Owner Portal Logic
async function loadOwnerDashboard() {
  try {
    const statsRes = await apiFetch(`/api/stats/shop/${state.ownerShopId}`);
    const statsData = await statsRes.json();

    if (statsData.success) {
      const d = statsData.data;
      document.getElementById('kpiTodayOrders').textContent = d.totalOrders;
      document.getElementById('kpiTodaySales').textContent = `৳${d.totalSales}`;
      document.getElementById('kpiPendingOrders').textContent = d.pendingOrders;
      document.getElementById('kpiTotalProducts').textContent = d.totalProducts;
    }

    loadOwnerOrders();
    loadOwnerInventory();
  } catch (err) {
    console.error('Failed to load owner dashboard:', err);
  }
}

async function loadOwnerOrders() {
  const container = document.getElementById('ownerOrdersListContainer');
  if (!container) return;

  try {
    const res = await apiFetch(`/api/orders?shopId=${state.ownerShopId}`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = data.data.map(order => `
        <div class="owner-order-card">
          <div class="order-top-row">
            <div>
              <span class="order-id">Order #${order.orderNumber}</span>
              <span class="badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}" style="margin-left: 0.5rem;">
                ${order.status}
              </span>
            </div>
            <strong>৳${order.totalPrice}</strong>
          </div>
          <div class="order-items-detail">
            <div><strong>Items:</strong> ${order.items.map(i => `${i.productName} × ${i.quantity}`).join(', ')}</div>
            <div style="margin-top: 3px; font-size: 0.78rem; color: var(--text-muted);">
              📍 ${order.deliveryAddress} • 📞 ${order.customerPhone} • Type: ${order.orderType}
            </div>
          </div>
          <div class="order-actions-bar">
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Placed: ${new Date(order.createdAt).toLocaleTimeString()}
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button class="btn btn-xs btn-outline" onclick="window.appOpenOrderChatById('${order._id}', '${order.orderNumber}')">💬 Chat</button>
              <button class="btn btn-xs btn-outline" onclick="window.appCallOrderPartyById('${order._id}')">📞 Call</button>
              ${order.status === 'PLACED' ? `
                <button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}', 'ACCEPTED')">Accept</button>
                <button class="btn btn-xs btn-outline" style="color: var(--danger);" onclick="window.appUpdateOrderStatus('${order._id}', 'CANCELLED')">Reject</button>
              ` : ''}
              ${order.status === 'ACCEPTED' ? `
                <button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}', 'PREPARING')">Start Packing</button>
              ` : ''}
              ${order.status === 'PREPARING' ? `
                <button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}', 'READY')">Mark Ready</button>
              ` : ''}
              ${order.status === 'READY' ? `
                <button class="btn btn-xs btn-primary" onclick="window.appUpdateOrderStatus('${order._id}', 'OUT_FOR_DELIVERY')">Send Delivery</button>
              ` : ''}
              ${order.status === 'OUT_FOR_DELIVERY' ? `
                <button class="btn btn-xs btn-success" onclick="window.appUpdateOrderStatus('${order._id}', 'DELIVERED')">Complete Delivery</button>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">${uiKey('no_orders_shop')}</div>`;
    }
  } catch (err) {
    console.error('Failed to load owner orders:', err);
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await apiFetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();

    if (data.success) {
      showToast(state.lang==='bn' ? `অর্ডারের অবস্থা পরিবর্তন হয়েছে: ${status}` : `Order status transitioned to: ${status}`);
      loadOwnerDashboard();
      if (state.activeOrder && state.activeOrder._id === orderId) {
        state.activeOrder.status = status;
        showOrderTracking(state.activeOrder);
      }
    }
  } catch (err) {
    console.error('Failed to update order status:', err);
  }
}

async function loadOwnerInventory() {
  const tbody = document.getElementById('ownerProductsTableBody');
  if (!tbody) return;

  try {
    const res = await apiFetch(`/api/shops/${state.ownerShopId}/products`);
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(p => `
        <tr>
          <td>
            <strong>${p.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.unit}</div>
          </td>
          <td><span class="badge badge-primary">${p.category}</span></td>
          <td><strong>৳${p.price}</strong></td>
          <td>
            <input 
              type="number" 
              value="${p.stock}" 
              id="stockInput_${p._id}" 
              style="width: 70px; padding: 4px 6px; border: 1px solid var(--border-color); border-radius: 4px;"
            >
          </td>
          <td>
            <span class="badge ${p.stock > 5 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}">
              ${p.stock > 5 ? '🟢 Available' : p.stock > 0 ? '🟡 Low Stock' : '🔴 Out of Stock'}
            </span>
          </td>
          <td>
            <button class="btn btn-xs btn-outline" onclick="window.appQuickUpdateStock('${p._id}')">
              Save
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load inventory:', err);
  }
}

async function quickUpdateStock(productId) {
  const val = document.getElementById(`stockInput_${productId}`)?.value;
  if (val === undefined) return;

  try {
    const res = await apiFetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: parseInt(val, 10) })
    });
    const data = await res.json();
    if (data.success) {
      showToast(ui('Product stock updated in MongoDB!','পণ্যের স্টক ডাটাবেজে আপডেট হয়েছে!'));
      loadOwnerInventory();
    }
  } catch (err) {
    showToast(ui('Failed to update stock','স্টক আপডেট করা যায়নি'));
  }
}

async function handleAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById('newProdName').value;
  const nameBn = document.getElementById('newProdNameBn').value;
  const category = document.getElementById('newProdCategory').value;
  const unit = document.getElementById('newProdUnit').value;
  const price = document.getElementById('newProdPrice').value;
  const stock = document.getElementById('newProdStock').value;

  try {
    const res = await apiFetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopId: state.ownerShopId,
        name,
        nameBn,
        category,
        unit,
        price,
        stock
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast(ui('New product added to shop inventory!','নতুন পণ্য দোকানের ইনভেন্টরিতে যোগ হয়েছে!'));
      document.getElementById('addProductModal').style.display = 'none';
      document.getElementById('formAddProduct').reset();
      loadOwnerDashboard();
    }
  } catch (err) {
    showToast(ui('Failed to add product','পণ্য যোগ করা যায়নি'));
  }
}

async function toggleShopStatus() {
  const badge = document.getElementById('ownerShopStatusBadge');
  const isOpen = badge.dataset.open === 'true' || badge.textContent.includes('Open') || badge.textContent.includes('খোলা');
  try {
    const res = await apiFetch(`/api/shops/${state.ownerShopId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open: !isOpen })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    badge.dataset.open = data.data.open ? 'true' : 'false'; badge.textContent = data.data.open ? `🟢 ${uiKey('open')}` : `🔴 ${uiKey('closed')}`;
    badge.className = data.data.open ? 'badge badge-success' : 'badge badge-danger';
    showToast(data.data.open ? ui('Shop is now open for customer orders','দোকান এখন ক্রেতার অর্ডারের জন্য খোলা') : ui('Shop is now closed for customer orders','দোকান এখন ক্রেতার অর্ডারের জন্য বন্ধ'));
  } catch (err) {
    showToast(err.message || ui('Failed to update shop status','দোকানের অবস্থা আপডেট করা যায়নি'));
  }
}

// Database Live Inspector Logic
async function loadDbInspector() {
  try {
    const res = await apiFetch('/api/db/collections');
    const data = await res.json();

    if (data.success) {
      const tabsBar = document.getElementById('dbCollectionsTabs');
      if (tabsBar) {
        tabsBar.innerHTML = data.collections.map(col => `
          <button 
            class="db-tab-btn ${col.name === state.currentDbCollection ? 'active' : ''}" 
            onclick="window.appInspectDbCollection('${col.name}')"
          >
            <i class="fa-solid fa-table"></i> ${col.name} (${col.count})
          </button>
        `).join('');
      }

      fetchDbCollectionDocs(state.currentDbCollection);
    }
  } catch (err) {
    console.error('Failed to load DB inspector:', err);
  }
}

async function fetchDbCollectionDocs(collectionName) {
  state.currentDbCollection = collectionName;
  document.getElementById('dbCurrentCollectionTitle').textContent = `${uiKey('collection')}: ${collectionName}`;
  
  // Highlight active tab
  document.querySelectorAll('.db-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(collectionName));
  });

  try {
    const res = await apiFetch(`/api/db/collection/${collectionName}`);
    const data = await res.json();

    if (data.success) {
      document.getElementById('dbResultsCount').textContent = uiKey('showing_documents',{count:data.count});
      document.getElementById('dbJsonDisplay').innerHTML = syntaxHighlightJson(data.data);
    }
  } catch (err) {
    document.getElementById('dbJsonDisplay').textContent = uiKey('error_loading_documents');
  }
}

async function executeCustomDbQuery() {
  const queryText = document.getElementById('dbQueryEditor').value.trim();
  if (!queryText) {
    showToast(ui('Please enter a valid JSON query or pipeline','সঠিক JSON কুয়েরি বা পাইপলাইন লিখুন'));
    return;
  }

  try {
    const parsed = JSON.parse(queryText);
    const body = Array.isArray(parsed) 
      ? { collection: state.currentDbCollection, pipeline: parsed } 
      : { collection: state.currentDbCollection, findQuery: parsed };

    const res = await apiFetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('dbResultsCount').textContent = uiKey('returned_results',{count:data.count});
      document.getElementById('dbJsonDisplay').innerHTML = syntaxHighlightJson(data.data);
      showToast(state.lang==='bn' ? `কুয়েরি সম্পন্ন হয়েছে! ${data.count}টি নথি পাওয়া গেছে।` : `Query executed! Returned ${data.count} documents.`);
    }
  } catch (err) {
    showToast(ui('Invalid JSON syntax in query editor','কুয়েরি এডিটরে JSON সিনট্যাক্স সঠিক নয়'));
  }
}

function syntaxHighlightJson(jsonObj) {
  let json = JSON.stringify(jsonObj, null, 2);
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key" style="color: #38BDF8; font-weight: 600;';
      } else {
        cls = 'string" style="color: #34D399;';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean" style="color: #F59E0B;';
    } else if (/null/.test(match)) {
      cls = 'null" style="color: #94A3B8;';
    } else {
      cls = 'number" style="color: #F472B6;';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

// Toast Notifications Helper
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-info text-primary"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global Window Helpers for inline HTML event handlers
window.appOpenStoreModal = openStoreModal;
window.appAddToCart = addToCart;
window.appUpdateCartQty = updateCartQuantity;
window.appUpdateOrderStatus = updateOrderStatus;
window.appQuickUpdateStock = quickUpdateStock;
window.appInspectDbCollection = fetchDbCollectionDocs;
window.appOpenOrderChatById = openOrderChatById;
window.appCallOrderPartyById = callOrderPartyById;
