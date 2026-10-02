import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Linking
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import MapView, { Marker, Circle } from 'react-native-maps';

const { width } = Dimensions.get('window');

const toBanglaDigits = (value) => String(value ?? '').replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const PRODUCT_CATEGORIES = [
  { value: 'Rice & Grains', en: 'Rice & Grains', bn: 'চাল ও শস্য' },
  { value: 'Lentils & Pulses', en: 'Lentils & Pulses', bn: 'ডাল ও ডালজাত' },
  { value: 'Dairy & Eggs', en: 'Dairy & Eggs', bn: 'দুধ ও ডিম' },
  { value: 'Oil & Ghee', en: 'Oil & Ghee', bn: 'তেল ও ঘি' },
  { value: 'Spices & Condiments', en: 'Spices & Condiments', bn: 'মসলা ও সস' },
  { value: 'Fruits & Vegetables', en: 'Fruits & Vegetables', bn: 'ফল ও সবজি' },
  { value: 'Meat & Fish', en: 'Meat & Fish', bn: 'মাংস ও মাছ' },
  { value: 'Bakery & Bread', en: 'Bakery & Bread', bn: 'বেকারি ও রুটি' },
  { value: 'Snacks & Biscuits', en: 'Snacks & Biscuits', bn: 'স্ন্যাকস ও বিস্কুট' },
  { value: 'Beverages', en: 'Beverages', bn: 'পানীয়' },
  { value: 'Tea & Coffee', en: 'Tea & Coffee', bn: 'চা ও কফি' },
  { value: 'Frozen Foods', en: 'Frozen Foods', bn: 'ফ্রোজেন খাবার' },
  { value: 'Instant Foods', en: 'Instant Foods', bn: 'ইনস্ট্যান্ট খাবার' },
  { value: 'Personal Care', en: 'Personal Care', bn: 'ব্যক্তিগত যত্ন' },
  { value: 'Baby Care', en: 'Baby Care', bn: 'শিশু যত্ন' },
  { value: 'Household & Cleaning', en: 'Household & Cleaning', bn: 'গৃহস্থালি ও পরিষ্কার' },
  { value: 'Stationery', en: 'Stationery', bn: 'স্টেশনারি' },
  { value: 'Pet Care', en: 'Pet Care', bn: 'পোষা প্রাণীর পণ্য' },
  { value: 'Electronics & Accessories', en: 'Electronics & Accessories', bn: 'ইলেকট্রনিক্স ও আনুষঙ্গিক' },
  { value: 'Others', en: 'Others / Custom', bn: 'অন্যান্য / নিজের ক্যাটাগরি' }
];

// One API address for the whole app. Production/EAS builds should set
// EXPO_PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com. Local Expo can still use your laptop IP.
const API_BASE = String(process.env.EXPO_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location?.origin
  ? window.location.origin
  : 'http://192.168.1.104:3000')).replace(/\/$/, '');

const mediaUrl = (value) => {
  const text = String(value || '');
  if (!text) return '';
  if (/^(https?:|data:|file:|content:)/i.test(text)) return text;
  return `${API_BASE}${text.startsWith('/') ? text : `/${text}`}`;
};

// Fallback seed data in case network is disconnected
const FALLBACK_SHOPS = [
  {
    _id: '65e01a2b8c9d4e001f11a011',
    shopName: 'Rahman Grocery',
    shopNameBn: 'রহমান গ্রোসারী স্টোর',
    description: 'Fresh everyday groceries, milk, bread, rice, oil & household essentials.',
    phone: '01811000002',
    address: 'House 14, Road 4, Sector 3, Uttara, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    openingTime: '07:30',
    closingTime: '23:00',
    rating: 4.8,
    totalRatings: 86,
    open: true,
    deliveryAvailable: true,
    minDeliveryOrder: 80,
    deliveryFee: 20,
    distanceMeters: 30.2,
    location: { type: 'Point', coordinates: [90.41275, 23.81055] }
  },
  {
    _id: '65e01a2b8c9d4e001f11a012',
    shopName: 'Karim General Store',
    shopNameBn: 'করিম জেনারেল স্টোর',
    description: 'Quality grains, pulses, fresh eggs, packaged dairy, and beverages.',
    phone: '01911000003',
    address: 'Road 3, Block B, Sector 3, Uttara, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    openingTime: '08:00',
    closingTime: '22:30',
    rating: 4.5,
    totalRatings: 54,
    open: true,
    deliveryAvailable: true,
    minDeliveryOrder: 100,
    deliveryFee: 20,
    distanceMeters: 90.4,
    location: { type: 'Point', coordinates: [90.41315, 23.81005] }
  },
  {
    _id: '65e01a2b8c9d4e001f11a013',
    shopName: 'Hasan Mini Supermarket',
    shopNameBn: 'হাসান মিনি সুপারমার্কেট',
    description: 'Full range of pantry staples, baby care, confectionery and hygiene.',
    phone: '01611000004',
    address: 'Road 5, Avenue 1, Sector 3, Uttara, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=80',
    openingTime: '08:30',
    closingTime: '22:00',
    rating: 4.6,
    totalRatings: 39,
    open: true,
    deliveryAvailable: false,
    minDeliveryOrder: 0,
    deliveryFee: 0,
    distanceMeters: 202.9,
    location: { type: 'Point', coordinates: [90.41120, 23.81140] }
  },
  {
    _id: '65e01a2b8c9d4e001f11a014',
    shopName: 'Bismillah Store',
    shopNameBn: 'বিসমিল্লাহ ভ্যারাইটিজ স্টোর',
    description: 'Spices, mustard oil, premium lentils and daily fresh produce.',
    phone: '01711223344',
    address: 'Road 8, Sector 3, Uttara, Dhaka',
    imageUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&auto=format&fit=crop&q=80',
    openingTime: '08:00',
    closingTime: '23:00',
    rating: 4.4,
    totalRatings: 28,
    open: false,
    deliveryAvailable: true,
    minDeliveryOrder: 150,
    deliveryFee: 25,
    distanceMeters: 391.6,
    location: { type: 'Point', coordinates: [90.41530, 23.81210] }
  }
];

const FALLBACK_PRODUCTS = [
  {
    _id: '65e01a2b8c9d4e001f11a031',
    shopId: '65e01a2b8c9d4e001f11a011',
    category: 'Rice & Grains',
    name: 'Miniket Premium Rice',
    nameBn: 'মিনিকেট প্রিমিয়াম চাল',
    price: 420,
    stock: 35,
    unit: '5 kg',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: '65e01a2b8c9d4e001f11a032',
    shopId: '65e01a2b8c9d4e001f11a011',
    category: 'Dairy & Eggs',
    name: 'Aarong Pasteurized Liquid Milk',
    nameBn: 'আড়ং তরল দুধ',
    price: 90,
    stock: 18,
    unit: '1 Litre',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: '65e01a2b8c9d4e001f11a033',
    shopId: '65e01a2b8c9d4e001f11a011',
    category: 'Dairy & Eggs',
    name: 'Farm Fresh Brown Eggs',
    nameBn: 'ফার্মের লাল ডিম (১ ডজন)',
    price: 155,
    stock: 40,
    unit: '12 pcs (1 Dozen)',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: '65e01a2b8c9d4e001f11a034',
    shopId: '65e01a2b8c9d4e001f11a011',
    category: 'Oil & Spices',
    name: 'Rupchanda Fortified Soybean Oil',
    nameBn: 'রূপচাঁদা সয়াবিন তেল',
    price: 190,
    stock: 22,
    unit: '1 Litre',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60'
  },
  {
    _id: '65e01a2b8c9d4e001f11a035',
    shopId: '65e01a2b8c9d4e001f11a011',
    category: 'Bakery & Bread',
    name: 'All Time Milk Bread',
    nameBn: 'অল টাইম মিল্ক ব্রেড',
    price: 55,
    stock: 12,
    unit: '400 gm',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60'
  }
];

const CATEGORIES = [
  { id: 'all', nameEn: 'All Items', nameBn: 'সব পণ্য', icon: '🛒' },
  { id: 'Rice & Grains', nameEn: 'Rice & Grains', nameBn: 'চাল ও ডাল', icon: '🍚' },
  { id: 'Dairy & Eggs', nameEn: 'Dairy & Eggs', nameBn: 'দুধ ও ডিম', icon: '🥛' },
  { id: 'Oil & Spices', nameEn: 'Oil & Spices', nameBn: 'তেল ও মসলা', icon: '🧂' },
  { id: 'Bakery & Bread', nameEn: 'Bakery & Bread', nameBn: 'বেকারি ও রুটি', icon: '🍞' },
  { id: 'Snacks & Tea', nameEn: 'Snacks & Tea', nameBn: 'চা ও নাশতা', icon: '☕' }
];

function AuthGate() {
  const [lang, setLang] = useState('bn');
  const [step, setStep] = useState('welcome');
  const [role, setRole] = useState(null);
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [idDocumentDataUrl, setIdDocumentDataUrl] = useState('');
  const [utilityBillDataUrl, setUtilityBillDataUrl] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', identifier: '', password: '',
    permanentAddress: '', verificationType: 'NID', verificationNumber: '', vehicleType: 'Bicycle'
  });

  const copy = lang === 'bn'
    ? { welcome: 'কাছের দোকান, সহজ কেনাকাটা', sub: 'আপনার কাছের দোকান এক জায়গায়', start: 'শুরু করুন', choose: 'আপনি কীভাবে ব্যবহার করবেন?', customer: 'ক্রেতা', customerSub: 'কেনাকাটা করুন', owner: 'দোকানদার', ownerSub: 'দোকান পরিচালনা করুন', rider: 'রাইডার', riderSub: 'ডেলিভারি সম্পন্ন করুন', login: 'লগইন', register: 'নিবন্ধন', name: 'পূর্ণ নাম', email: 'ইমেইল', phone: 'ফোন নম্বর', identifier: 'ইমেইল অথবা ফোন', password: 'পাসওয়ার্ড', photo: 'ছবি যোগ করুন', submitLogin: 'লগইন করুন', submitRegister: 'অ্যাকাউন্ট তৈরি করুন', back: 'ফিরে যান', optionalVerification:'ঐচ্ছিক রাইডার যাচাই', permanentAddress:'স্থায়ী ঠিকানা', vehicleType:'যানের ধরন (সাইকেল/মোটরসাইকেল)', birthCertificate:'জন্মনিবন্ধন', verificationNumber:'পরিচয়পত্র / জন্মনিবন্ধন নম্বর', idSelected:'পরিচয়পত্রের ছবি নির্বাচিত', addId:'পরিচয়পত্রের ছবি যোগ করুন (ঐচ্ছিক)', utilitySelected:'ইউটিলিটি বিল নির্বাচিত', addUtility:'বিদ্যুৎ/গ্যাস বিলের ছবি যোগ করুন (ঐচ্ছিক)', permissionNeeded:'অনুমতি প্রয়োজন', photoPermission:'ছবি যোগ করতে গ্যালারির অনুমতি দিন।', authFailed:'লগইন বা নিবন্ধন সম্পন্ন করা যায়নি।' }
    : { welcome: 'Find nearby. Shop easily.', sub: 'Your neighborhood shops, all in one place', start: 'Get Started', choose: 'How will you use Kacher Dokan?', customer: 'Customer', customerSub: 'Shop for groceries', owner: 'Shop Owner', ownerSub: 'Manage your shop', rider: 'Rider', riderSub: 'Deliver nearby orders', login: 'Log in', register: 'Register', name: 'Full name', email: 'Email', phone: 'Phone', identifier: 'Email or phone', password: 'Password', photo: 'Add profile photo', submitLogin: 'Log in', submitRegister: 'Create account', back: 'Back', optionalVerification:'Optional rider verification', permanentAddress:'Permanent address', vehicleType:'Vehicle type (Bicycle/Motorbike)', birthCertificate:'Birth Certificate', verificationNumber:'NID / Birth Certificate number', idSelected:'ID document selected', addId:'Add ID document photo (optional)', utilitySelected:'Utility bill selected', addUtility:'Add electricity/gas bill photo (optional)', permissionNeeded:'Permission needed', photoPermission:'Please allow photo access to add an image.', authFailed:'Authentication failed.' };

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert(copy.permissionNeeded, copy.photoPermission);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.72, base64: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      if (asset.base64) setImageDataUrl(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
    }
  };

  const chooseVerificationImage = async (kind) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert(lang==='bn'?'অনুমতি প্রয়োজন':'Permission needed', lang==='bn'?'ছবি নির্বাচন করতে গ্যালারির অনুমতি দিন।':'Please allow photo access.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.65, base64: true });
    if (!result.canceled) {
      const asset = result.assets[0];
      const dataUrl = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '';
      if (kind === 'id') setIdDocumentDataUrl(dataUrl);
      else setUtilityBillDataUrl(dataUrl);
    }
  };

  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const apiRole = role === 'owner' ? 'SHOP_OWNER' : role === 'rider' ? 'RIDER' : 'USER';
  const submit = async () => {
    setBusy(true);
    try {
      const registering = mode === 'register';
      const payload = registering
        ? { ...form, role: apiRole, language: lang, imageDataUrl, idDocumentDataUrl, utilityBillDataUrl }
        : { identifier: form.identifier, password: form.password, role: apiRole };
      const response = await fetch(`${API_BASE}/api/auth/${registering ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(lang==='bn' ? copy.authFailed : (data.message || copy.authFailed));
      setStep('done');
      setTimeout(() => setSession({ token: data.token, user: data.user, shops: data.shops || [] }), 0);
    } catch (error) {
      Alert.alert(lang === 'bn' ? 'সমস্যা হয়েছে' : 'Unable to continue', error.message);
    } finally { setBusy(false); }
  };

  const [session, setSession] = useState(null);
  if (session) {
    const mappedRole = session.user.role === 'SHOP_OWNER' ? 'owner' : session.user.role === 'RIDER' ? 'rider' : 'customer';
    return <MainApp role={mappedRole} user={session.user} shops={session.shops} token={session.token} onLogout={() => setSession(null)} />;
  }

  return (
    <SafeAreaView style={styles.authSafeArea}>
      <StatusBar barStyle="light-content" />
      <Image source={require('./assets/splash-icon.png')} style={styles.authLogo} />
      {step === 'welcome' && <View style={styles.authWelcome}><Text style={styles.authKicker}>{lang === 'bn' ? 'কাছের দোকান' : 'Kacher Dokan'}</Text><Text style={styles.authHeroTitle}>{copy.welcome}</Text><Text style={styles.authHeroSub}>{copy.sub}</Text><View style={styles.authLangRow}><TouchableOpacity onPress={() => setLang('bn')}><Text style={[styles.authLang, lang === 'bn' && styles.authLangActive]}>{lang==='bn'?'বাংলা':'Bangla'}</Text></TouchableOpacity><TouchableOpacity onPress={() => setLang('en')}><Text style={[styles.authLang, lang === 'en' && styles.authLangActive]}>{lang==='bn'?'ইংরেজি':'English'}</Text></TouchableOpacity></View><TouchableOpacity style={styles.authPrimaryButton} onPress={() => setStep('role')}><Text style={styles.authPrimaryText}>{copy.start} →</Text></TouchableOpacity></View>}
      {step === 'role' && <View style={styles.authPanel}><Text style={styles.authPanelTitle}>{copy.choose}</Text><View style={styles.authRoleGrid}><TouchableOpacity style={styles.authRoleCard} onPress={() => { setRole('customer'); setStep('form'); }}><Text style={styles.authRoleIcon}>🛒</Text><Text style={styles.authRoleTitle}>{copy.customer}</Text><Text style={styles.authRoleSub}>{copy.customerSub}</Text></TouchableOpacity><TouchableOpacity style={styles.authRoleCard} onPress={() => { setRole('owner'); setStep('form'); }}><Text style={styles.authRoleIcon}>🏪</Text><Text style={styles.authRoleTitle}>{copy.owner}</Text><Text style={styles.authRoleSub}>{copy.ownerSub}</Text></TouchableOpacity><TouchableOpacity style={styles.authRoleCard} onPress={() => { setRole('rider'); setStep('form'); }}><Text style={styles.authRoleIcon}>🛵</Text><Text style={styles.authRoleTitle}>{copy.rider}</Text><Text style={styles.authRoleSub}>{copy.riderSub}</Text></TouchableOpacity></View><TouchableOpacity onPress={() => setLang(lang === 'bn' ? 'en' : 'bn')}><Text style={styles.authLink}>{lang==='bn'?'বাংলা / ইংরেজি':'Bangla / English'}</Text></TouchableOpacity></View>}
      {step === 'form' && <ScrollView contentContainerStyle={styles.authPanel} keyboardShouldPersistTaps="handled"><TouchableOpacity onPress={() => setStep('role')}><Text style={styles.authBack}>← {copy.back}</Text></TouchableOpacity><Text style={styles.authPanelTitle}>{role === 'owner' ? copy.owner : role === 'rider' ? copy.rider : copy.customer}</Text><View style={styles.authModeRow}><TouchableOpacity onPress={() => setMode('login')}><Text style={[styles.authModeText, mode === 'login' && styles.authModeActive]}>{copy.login}</Text></TouchableOpacity><TouchableOpacity onPress={() => setMode('register')}><Text style={[styles.authModeText, mode === 'register' && styles.authModeActive]}>{copy.register}</Text></TouchableOpacity></View>{mode === 'register' && <><TextInput style={styles.authInput} placeholder={copy.name} placeholderTextColor="#94a3b8" value={form.name} onChangeText={value => update('name', value)} /><TextInput style={styles.authInput} placeholder={copy.phone} placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={form.phone} onChangeText={value => update('phone', value)} /><TextInput style={styles.authInput} placeholder={copy.email} placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={value => update('email', value)} /><TouchableOpacity style={styles.authPhotoButton} onPress={chooseImage}>{imageUri ? <Image source={{ uri: imageUri }} style={styles.authPhoto} /> : <Text style={styles.authPhotoText}>📷 {copy.photo}</Text>}</TouchableOpacity>{role === 'rider' && <View style={styles.riderRegistrationBox}><Text style={styles.formLabel}>{copy.optionalVerification}</Text><TextInput style={styles.authInput} placeholder={copy.permanentAddress} placeholderTextColor="#94a3b8" value={form.permanentAddress} onChangeText={value => update('permanentAddress', value)} /><TextInput style={styles.authInput} placeholder={copy.vehicleType} placeholderTextColor="#94a3b8" value={form.vehicleType} onChangeText={value => update('vehicleType', value)} /><View style={styles.authModeRow}><TouchableOpacity onPress={() => update('verificationType', 'NID')}><Text style={[styles.authModeText, form.verificationType === 'NID' && styles.authModeActive]}>{lang==='bn'?'জাতীয় পরিচয়পত্র':'NID'}</Text></TouchableOpacity><TouchableOpacity onPress={() => update('verificationType', 'BIRTH_CERTIFICATE')}><Text style={[styles.authModeText, form.verificationType === 'BIRTH_CERTIFICATE' && styles.authModeActive]}>{copy.birthCertificate}</Text></TouchableOpacity></View><TextInput style={styles.authInput} placeholder={copy.verificationNumber} placeholderTextColor="#94a3b8" value={form.verificationNumber} onChangeText={value => update('verificationNumber', value)} /><TouchableOpacity style={styles.authPhotoButton} onPress={() => chooseVerificationImage('id')}><Text style={styles.authPhotoText}>{idDocumentDataUrl ? `✅ ${copy.idSelected}` : `📄 ${copy.addId}`}</Text></TouchableOpacity><TouchableOpacity style={styles.authPhotoButton} onPress={() => chooseVerificationImage('utility')}><Text style={styles.authPhotoText}>{utilityBillDataUrl ? `✅ ${copy.utilitySelected}` : `🧾 ${copy.addUtility}`}</Text></TouchableOpacity></View>}</>}{mode === 'login' && <TextInput style={styles.authInput} placeholder={copy.identifier} placeholderTextColor="#94a3b8" autoCapitalize="none" value={form.identifier} onChangeText={value => update('identifier', value)} />}<TextInput style={styles.authInput} placeholder={copy.password} placeholderTextColor="#94a3b8" secureTextEntry value={form.password} onChangeText={value => update('password', value)} /><TouchableOpacity style={styles.authPrimaryButton} onPress={submit} disabled={busy}><Text style={styles.authPrimaryText}>{busy ? '...' : mode === 'register' ? copy.submitRegister : copy.submitLogin}</Text></TouchableOpacity></ScrollView>}
    </SafeAreaView>
  );
}

function MainApp({ role: initialRole = 'customer', user, shops: initialShops = [], token, onLogout }) {
  const [role] = useState(initialRole); // fixed by authenticated account: customer / owner / rider
  const [lang, setLang] = useState(user?.language === 'en' ? 'en' : 'bn'); // 'bn' or 'en'
  const [radius, setRadius] = useState(200); // 100, 200, 500, 1000
  const [shops, setShops] = useState([]);
  const [mapShops, setMapShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orderType, setOrderType] = useState('DELIVERY'); // 'DELIVERY' or 'PICKUP'
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState(user?.phone || '');
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [orderContact, setOrderContact] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Active Order Tracking
  const [activeOrder, setActiveOrder] = useState(null);
  const [trackingVisible, setTrackingVisible] = useState(false);

  // Owner Dashboard state
  const [ownerOrders, setOwnerOrders] = useState([]);
  const [loadingOwnerOrders, setLoadingOwnerOrders] = useState(false);

  // Connection status
  const [serverOnline, setServerOnline] = useState(false);
  const [ownerShop, setOwnerShop] = useState(initialShops[0] || null);
  const [profileImage, setProfileImage] = useState(user?.imageUrl || '');
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profilePermanentAddress, setProfilePermanentAddress] = useState(user?.permanentAddress || '');
  const [profileVehicleType, setProfileVehicleType] = useState(user?.vehicleType || 'Bicycle');

  // Mobile parity state: customer orders, rider workflow, seller rider offers and notifications
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);
  const [riderAvailable, setRiderAvailable] = useState(user?.riderAvailable !== false);
  const [riderNearbyOrders, setRiderNearbyOrders] = useState([]);
  const [riderMineOrders, setRiderMineOrders] = useState([]);
  const [riderLoading, setRiderLoading] = useState(false);
  const [pickupCodeInputs, setPickupCodeInputs] = useState({});
  const [ownerRiderOffers, setOwnerRiderOffers] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [ownerProducts, setOwnerProducts] = useState([]);
  const [loadingOwnerProducts, setLoadingOwnerProducts] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmount, setRestockAmount] = useState('10');
  const [restockVisible, setRestockVisible] = useState(false);
  const [editProductVisible, setEditProductVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [savingProductEdit, setSavingProductEdit] = useState(false);
  const [addProductVisible, setAddProductVisible] = useState(false);
  const [savingNewProduct, setSavingNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', nameBn: '', category: 'Rice & Grains', customCategory: '', brand: '', description: '', unit: '1 unit', price: '', stock: '', available: true, imageUrl: '/images/products/grocery.svg' });

  const [lowStockReminderShown, setLowStockReminderShown] = useState(false);
  const [ownerAnalytics, setOwnerAnalytics] = useState(null);
  const [loadingOwnerAnalytics, setLoadingOwnerAnalytics] = useState(false);
  const [ownerPayments, setOwnerPayments] = useState([]);
  const [loadingOwnerPayments, setLoadingOwnerPayments] = useState(false);
  const lastSpokenPaymentIdRef = useRef(null);
  const ownerPaymentsInitializedRef = useRef(false);

  useEffect(() => {
    if (user?.phone && !paymentSenderPhone) setPaymentSenderPhone(user.phone);
  }, [user?.phone, paymentSenderPhone]);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');

  // Mobile location + simplified customer navigation.
  // The default coordinates are only a safe demo fallback until device permission resolves.
  const DEFAULT_COORDS = { latitude: 23.8103, longitude: 90.4125 };
  const [userCoords, setUserCoords] = useState(DEFAULT_COORDS);
  const [locationLabel, setLocationLabel] = useState(lang === 'bn' ? 'লোকেশন খোঁজা হচ্ছে…' : 'Finding your location…');
  const [locationStatus, setLocationStatus] = useState('loading'); // loading | ready | denied | error | demo
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [customerScreen, setCustomerScreen] = useState('home'); // home | orders

  const L = useCallback((bn, en) => lang === 'bn' ? bn : en, [lang]);
  const localError = useCallback((message, bnFallback, enFallback) => lang === 'bn' ? bnFallback : (message || enFallback), [lang]);

  const authHeaders = useCallback((headers = {}) => ({ ...headers, Authorization: `Bearer ${token}` }), [token]);

  const changeLanguage = useCallback((nextLanguage) => {
    const next = nextLanguage === 'bn' ? 'bn' : 'en';
    setLang(next);
    // UI language and ALL spoken alerts always move together. Persist best-effort.
    fetch(`${API_BASE}/api/auth/language`, { method:'PUT', headers: authHeaders({ 'Content-Type':'application/json' }), body:JSON.stringify({ language:next }) }).catch(()=>{});
    try { Speech.stop(); } catch (_) {}
  }, [authHeaders]);

  const uploadImageDataUrl = useCallback(async (dataUrl, kind = 'profile') => {
    const response = await fetch(`${API_BASE}/api/uploads/image`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ kind, dataUrl })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Image upload failed.');
    return data.url;
  }, [authHeaders]);

  const chooseProfilePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert(lang==='bn'?'অনুমতি প্রয়োজন':'Permission needed', lang==='bn'?'ছবি নির্বাচন করতে গ্যালারির অনুমতি দিন।':'Please allow photo access.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.72, base64: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) throw new Error(lang==='bn'?'নির্বাচিত ছবি পড়া যায়নি।':'Could not read selected photo.');
      const mime = asset.mimeType || 'image/jpeg';
      const uploadedUrl = await uploadImageDataUrl(`data:${mime};base64,${asset.base64}`, 'profile');
      setProfileImage(uploadedUrl);
    } catch (error) { Alert.alert(lang==='bn'?'প্রোফাইল ছবি':'Profile photo', error.message); }
  };

  const saveProfile = async () => {
    try {
      const result = await fetch(`${API_BASE}/api/auth/profile`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ name: profileName, phone: profilePhone, imageUrl: profileImage, address: profileAddress, permanentAddress: profilePermanentAddress, vehicleType: profileVehicleType }) });
      const data = await result.json();
      if (!result.ok || !data.success) throw new Error(data.message || 'Profile update failed.');
      setOwnerShop(data.shops?.[0] || ownerShop);
      setProfileImage(data.user?.imageUrl || profileImage);
      setProfileAddress(data.user?.address || profileAddress);
      setProfilePermanentAddress(data.user?.permanentAddress || profilePermanentAddress);
      setProfileVehicleType(data.user?.vehicleType || profileVehicleType);
      setProfileVisible(false);
      Alert.alert(lang === 'bn' ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated');
    } catch (error) {
      Alert.alert(lang === 'bn' ? 'সমস্যা হয়েছে' : 'Unable to update profile', error.message);
    }
  };

  const t = {
    appName: lang === 'bn' ? 'কাছের দোকান' : 'Kacher Dokan',
    tagline: lang === 'bn' ? 'কাছের দোকান, সহজ কেনাকাটা' : 'Hyperlocal Grocery in Minutes',
    locationPill: lang === 'bn' ? 'বর্তমান লোকেশন' : 'Current location',
    searchPlaceholder: lang === 'bn' ? 'মুদির সামগ্রী খুঁজুন (চাল, ডিম, দুধ, তেল)...' : 'Find nearby grocery (Rice, Milk, Eggs)...',
    radiusHeader: lang === 'bn' ? 'দূরত্ব অনুযায়ী দোকান ফিল্টার' : 'Distance Radius Filter',
    nearbyShops: lang === 'bn' ? 'আপনার কাছের মুদি দোকানসমূহ' : 'Grocery Shops Near You',
    openBadge: lang === 'bn' ? 'খোলা আছে' : 'OPEN',
    closedBadge: lang === 'bn' ? 'বন্ধ' : 'CLOSED',
    delivery: lang === 'bn' ? 'হোম ডেলিভারি' : 'Home Delivery',
    pickupOnly: lang === 'bn' ? 'শুধুমাত্র পিকআপ' : 'Pickup Only',
    minOrder: lang === 'bn' ? 'সর্বনিম্ন অর্ডার' : 'Min Order',
    fee: lang === 'bn' ? 'ডেলিভারি ফি' : 'Delivery Fee',
    metersAway: lang === 'bn' ? 'মিটার দূরত্বে' : 'meters away',
    addToCart: lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart',
    cartTitle: lang === 'bn' ? 'আপনার শপিং কার্ট' : 'Your Shopping Cart',
    checkout: lang === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order',
    subtotal: lang === 'bn' ? 'পণ্য মূল্য' : 'Subtotal',
    total: lang === 'bn' ? 'সর্বমোট' : 'Grand Total',
    addressLabel: lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address',
    phoneLabel: lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number',
    trackOrder: lang === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Live Order Tracking',
    ownerPortal: lang === 'bn' ? 'দোকানদার পোর্টাল' : 'Shop Owner Portal',
    customerView: lang === 'bn' ? 'গ্রাহক মোড' : 'Customer Mode',
    stock: lang === 'bn' ? 'মজুদ' : 'Stock',
    outOfStock: lang === 'bn' ? 'মজুদ শেষ' : 'Out of Stock'
  };

  const buildLocationLabel = useCallback((place, coords) => {
    const candidates = [
      place?.name,
      place?.street,
      place?.district,
      place?.city,
      place?.subregion,
      place?.region
    ].map(value => String(value || '').trim()).filter(Boolean);
    const unique = candidates.filter((value, index) => candidates.findIndex(v => v.toLowerCase() === value.toLowerCase()) === index);
    if (unique.length) return unique.slice(0, 3).join(', ');
    return `${Number(coords.latitude).toFixed(5)}, ${Number(coords.longitude).toFixed(5)}`;
  }, []);

  const refreshCurrentLocation = useCallback(async ({ silent = false } = {}) => {
    if (role === 'owner') return;
    setLocationStatus('loading');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationStatus('denied');
        setLocationLabel(lang === 'bn' ? 'লোকেশন অনুমতি বন্ধ — ডেমো লোকেশন ব্যবহার হচ্ছে' : 'Location permission off — using demo location');
        if (!silent) Alert.alert(
          lang === 'bn' ? 'লোকেশন অনুমতি প্রয়োজন' : 'Location permission needed',
          lang === 'bn' ? 'কাছের দোকান ও সঠিক দূরত্ব দেখাতে Location permission Allow করুন।' : 'Allow Location so we can show nearby shops and accurate distance.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setUserCoords(coords);
      setLocationAccuracy(Number(position.coords.accuracy || 0));
      let label = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
      try {
        const places = await Location.reverseGeocodeAsync(coords);
        label = buildLocationLabel(places?.[0], coords);
      } catch (_) {}
      setLocationLabel(label);
      setLocationStatus('ready');
      setAddress(previous => String(previous || '').trim() ? previous : label);
    } catch (error) {
      setLocationStatus('error');
      setLocationLabel(lang === 'bn' ? 'লোকেশন পাওয়া যায়নি — ডেমো লোকেশন ব্যবহার হচ্ছে' : 'Location unavailable — using demo location');
      if (!silent) Alert.alert(lang === 'bn' ? 'লোকেশন পাওয়া যায়নি' : 'Location unavailable', error.message || 'Please try again.');
    }
  }, [role, lang, buildLocationLabel]);

  const useDemoLocation = useCallback(() => {
    setUserCoords(DEFAULT_COORDS);
    setLocationAccuracy(null);
    setLocationStatus('demo');
    setLocationLabel(lang === 'bn' ? 'ডেমো লোকেশন: উত্তরা সেক্টর ৩, ঢাকা' : 'Demo location: Uttara Sector 3, Dhaka');
  }, [lang]);

  const openCurrentLocationMap = useCallback(async () => {
    const { latitude, longitude } = userCoords;
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=Current%20Location`
      : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    try { await Linking.openURL(url); } catch (_) {}
  }, [userCoords]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications?limit=40`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.data || []);
        setNotificationUnread(data.unread || 0);
      }
    } catch (e) {}
  }, [authHeaders]);

  const markNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'POST', headers: authHeaders() });
      setNotificationUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const fetchCustomerOrders = useCallback(async () => {
    if (role !== 'customer') return;
    setLoadingCustomerOrders(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setCustomerOrders(data.data || []);
    } catch (e) {} finally { setLoadingCustomerOrders(false); }
  }, [role, authHeaders]);

  const fetchRiderOrders = useCallback(async () => {
    if (role !== 'rider') return;
    setRiderLoading(true);
    try {
      const [nearbyRes, mineRes] = await Promise.all([
        fetch(`${API_BASE}/api/rider/orders/nearby?lat=${userCoords.latitude}&lng=${userCoords.longitude}&radius=5000`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/rider/orders/mine`, { headers: authHeaders() })
      ]);
      const nearby = await nearbyRes.json();
      const mine = await mineRes.json();
      if (nearbyRes.ok && nearby.success) {
        setRiderAvailable(nearby.available !== false);
        setRiderNearbyOrders(nearby.data || []);
      }
      if (mineRes.ok && mine.success) setRiderMineOrders(mine.data || []);
    } catch (e) {} finally { setRiderLoading(false); }
  }, [role, authHeaders, userCoords.latitude, userCoords.longitude]);

  const toggleRiderAvailability = async () => {
    try {
      const next = !riderAvailable;
      const res = await fetch(`${API_BASE}/api/rider/availability`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ available: next, lat: userCoords.latitude, lng: userCoords.longitude }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to change availability.');
      setRiderAvailable(next);
      await fetchRiderOrders();
      await fetchNotifications();
    } catch (e) { Alert.alert(L('রাইডার','Rider'), localError(e.message,'কাজটি সম্পন্ন করা যায়নি।','Unable to complete the action.')); }
  };

  const offerDelivery = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/rider/orders/${orderId}/offer`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: '{}' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Offer could not be sent.');
      Alert.alert(lang === 'bn' ? 'অফার পাঠানো হয়েছে' : 'Offer sent', lang === 'bn' ? 'দোকানদার এখন আপনার অফার দেখতে পারবেন।' : 'The seller can now review your delivery offer.');
      await fetchRiderOrders();
      await fetchNotifications();
    } catch (e) { Alert.alert(L('রাইডার','Rider'), localError(e.message,'কাজটি সম্পন্ন করা যায়নি।','Unable to complete the action.')); }
  };

  const verifyPickup = async (orderId) => {
    const code = String(pickupCodeInputs[orderId] || '').trim();
    if (!code) return Alert.alert(L('সংগ্রহ কোড','Pickup code'), L('দোকানদারকে দেখানো সংগ্রহ কোডটি লিখুন।','Enter the pickup code shown to the seller.'));
    try {
      const res = await fetch(`${API_BASE}/api/rider/orders/${orderId}/verify-pickup`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ pickupCode: code }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Pickup verification failed.');
      Alert.alert(L('সংগ্রহ যাচাই হয়েছে','Pickup verified'), L('অর্ডারটি এখন ডেলিভারির পথে।','Order is now out for delivery.'));
      await fetchRiderOrders();
    } catch (e) { Alert.alert(L('সংগ্রহ কোড','Pickup code'), localError(e.message,'সংগ্রহ যাচাই করা যায়নি।','Pickup verification failed.')); }
  };

  const markRiderDelivered = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/api/rider/orders/${orderId}/delivered`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: '{}' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to complete delivery.');
      Alert.alert(L('ডেলিভারি সম্পন্ন','Delivered'), L('ডেলিভারিটি সম্পন্ন হিসেবে চিহ্নিত হয়েছে।','Delivery marked as completed.'));
      await fetchRiderOrders();
      await fetchNotifications();
    } catch (e) { Alert.alert(L('ডেলিভারি','Delivery'), localError(e.message,'ডেলিভারি সম্পন্ন করা যায়নি।','Unable to complete delivery.')); }
  };

  const fetchOwnerRiderOffers = useCallback(async () => {
    if (role !== 'owner' || !ownerShop?._id) return;
    try {
      const res = await fetch(`${API_BASE}/api/shops/${ownerShop._id}/rider-offers`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setOwnerRiderOffers(data.data || []);
    } catch (e) {}
  }, [role, ownerShop?._id, authHeaders]);

  const lowStockProducts = useMemo(() => ownerProducts.filter(product => Number(product.stock) < 5), [ownerProducts]);

  const fetchOwnerInventory = useCallback(async () => {
    if (role !== 'owner' || !ownerShop?._id) return;
    setLoadingOwnerProducts(true);
    try {
      const res = await fetch(`${API_BASE}/api/shops/${ownerShop._id}/products`);
      const data = await res.json();
      if (res.ok && data.success) setOwnerProducts(data.data || []);
    } catch (e) {
      // Keep the last successful inventory on screen if the network briefly drops.
    } finally { setLoadingOwnerProducts(false); }
  }, [role, ownerShop?._id]);

  const showLowStockReminder = useCallback(() => {
    if (!lowStockProducts.length) return;
    const names = lowStockProducts.map(product => product.nameBn || product.name).join(', ');
    Alert.alert(
      '⚠️ গুরুত্বপূর্ণ রিমাইন্ডার',
      `আপনার দোকানে ${names} এর স্টক প্রায় শেষ। ৫টির কম আছে। অনুগ্রহ করে রিস্টক করুন।`
    );
  }, [lowStockProducts]);

  const openRestock = (product) => {
    setRestockTarget(product);
    setRestockAmount('10');
    setRestockVisible(true);
  };

  const submitRestock = async () => {
    if (!restockTarget?._id) return;
    const addQuantity = Number.parseInt(restockAmount, 10);
    if (!Number.isInteger(addQuantity) || addQuantity < 1) {
      return Alert.alert(L('স্টক যোগ করুন','Restock'), L('শূন্যের বেশি একটি পূর্ণ সংখ্যা লিখুন।','Please enter a positive whole number.'));
    }
    try {
      const res = await fetch(`${API_BASE}/api/products/${restockTarget._id}/restock`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ addQuantity })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to restock product.');
      setRestockVisible(false);
      setRestockTarget(null);
      Alert.alert(lang === 'bn' ? 'স্টক আপডেট হয়েছে' : 'Stock updated', `${data.data.name} · ${data.data.stock} in stock`);
      await fetchOwnerInventory();
      await fetchNotifications();
      if (selectedShop?._id && String(selectedShop._id) === String(data.data.shopId)) await fetchProducts(selectedShop._id);
    } catch (e) { Alert.alert(L('স্টক যোগ করুন','Restock'), localError(e.message,'স্টক আপডেট করা যায়নি।','Unable to restock product.')); }
  };

  const resetNewProduct = () => setNewProduct({ name: '', nameBn: '', category: 'Rice & Grains', customCategory: '', brand: '', description: '', unit: '1 unit', price: '', stock: '', available: true, imageUrl: '/images/products/grocery.svg' });

  const chooseNewProductPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert(lang === 'bn' ? 'অনুমতি প্রয়োজন' : 'Permission needed', lang === 'bn' ? 'ছবি বাছাই করতে গ্যালারির অনুমতি দিন।' : 'Please allow photo access.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.72, base64: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) throw new Error(lang === 'bn' ? 'ছবিটি পড়া যায়নি।' : 'Could not read selected image.');
      setNewProduct(prev => ({ ...prev, imageUrl: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` }));
    } catch (e) { Alert.alert(lang === 'bn' ? 'পণ্যের ছবি' : 'Product photo', e.message); }
  };

  const submitNewProduct = async () => {
    if (!ownerShop?._id) return Alert.alert(lang === 'bn' ? 'দোকান পাওয়া যায়নি' : 'Shop not found');
    const price = Number(newProduct.price); const stock = Number.parseInt(newProduct.stock, 10);
    if (!newProduct.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return Alert.alert(lang === 'bn' ? 'তথ্য ঠিক করুন' : 'Check details', lang === 'bn' ? 'সঠিক নাম, দাম ও স্টক লিখুন।' : 'Enter a valid name, price and stock.');
    setSavingNewProduct(true);
    try {
      let imageUrl = newProduct.imageUrl || '/images/products/grocery.svg';
      if (String(imageUrl).startsWith('data:image/')) imageUrl = await uploadImageDataUrl(imageUrl, 'product');
      const finalCategory = newProduct.category === 'Others' ? String(newProduct.customCategory || '').trim() : String(newProduct.category || 'Rice & Grains').trim();
      if (!finalCategory) throw new Error(lang === 'bn' ? 'নিজের ক্যাটাগরির নাম লিখুন।' : 'Enter your custom category name.');
      const payload = { shopId: ownerShop._id, name: newProduct.name.trim(), nameBn: String(newProduct.nameBn||'').trim(), category: finalCategory, brand: String(newProduct.brand||'').trim(), description: String(newProduct.description||'').trim(), unit: String(newProduct.unit||'1 unit').trim(), price, stock, available: Boolean(newProduct.available), imageUrl };
      const response = await fetch(`${API_BASE}/api/products`, { method:'POST', headers: authHeaders({'Content-Type':'application/json'}), body: JSON.stringify(payload) });
      const data = await response.json(); if(!response.ok || !data.success) throw new Error(data.message || (lang==='bn'?'পণ্য যোগ করা যায়নি।':'Unable to add product.'));
      setAddProductVisible(false); resetNewProduct(); await fetchOwnerInventory();
      Alert.alert(lang==='bn'?'পণ্য যোগ হয়েছে':'Product added', lang==='bn'?'নতুন পণ্য এখন ক্রেতারা দেখতে পারবেন।':'The new product is now available to customers.');
    } catch(e){ Alert.alert(lang==='bn'?'ইনভেন্টরি':'Inventory', e.message); } finally { setSavingNewProduct(false); }
  };

  const openProductEditor = (product) => {
    setEditProduct({
      ...product,
      name: product?.name || '',
      nameBn: product?.nameBn || '',
      category: PRODUCT_CATEGORIES.some(cat => cat.value === product?.category) ? (product?.category || 'Rice & Grains') : 'Others',
      customCategory: PRODUCT_CATEGORIES.some(cat => cat.value === product?.category) ? '' : (product?.category || ''),
      brand: product?.brand || '',
      description: product?.description || '',
      unit: product?.unit || '1 unit',
      price: String(product?.price ?? 0),
      stock: String(product?.stock ?? 0),
      available: product?.available !== false,
      imageUrl: product?.imageUrl || '/images/products/grocery.svg'
    });
    setEditProductVisible(true);
  };

  const chooseProductEditPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert(lang==='bn'?'অনুমতি প্রয়োজন':'Permission needed', lang==='bn'?'ছবি নির্বাচন করতে গ্যালারির অনুমতি দিন।':'Please allow photo access.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.72, base64: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) throw new Error(lang==='bn'?'নির্বাচিত ছবি পড়া যায়নি।':'Could not read selected image.');
      const mime = asset.mimeType || 'image/jpeg';
      setEditProduct(previous => previous ? ({ ...previous, imageUrl: `data:${mime};base64,${asset.base64}` }) : previous);
    } catch (error) { Alert.alert(lang==='bn'?'পণ্যের ছবি':'Product photo', error.message); }
  };

  const saveProductEdit = async () => {
    if (!editProduct?._id) return;
    const price = Number(editProduct.price);
    const stock = Number.parseInt(editProduct.stock, 10);
    const finalEditCategory = editProduct.category === 'Others' ? String(editProduct.customCategory || '').trim() : String(editProduct.category || '').trim();
    if (!editProduct.name.trim() || !finalEditCategory || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return Alert.alert(lang==='bn'?'ইনভেন্টরি':'Inventory', lang==='bn'?'সঠিক পণ্যের নাম, ক্যাটাগরি, দাম ও স্টক দিন।':'Enter a valid product name, category, price and stock.');
    }
    setSavingProductEdit(true);
    try {
      let imageUrl = editProduct.imageUrl || '/images/products/grocery.svg';
      if (String(imageUrl).startsWith('data:image/')) imageUrl = await uploadImageDataUrl(imageUrl, 'product');
      const payload = {
        name: editProduct.name.trim(),
        nameBn: String(editProduct.nameBn || '').trim(),
        category: finalEditCategory,
        brand: String(editProduct.brand || '').trim(),
        description: String(editProduct.description || '').trim(),
        unit: String(editProduct.unit || '1 unit').trim(),
        price,
        stock,
        available: Boolean(editProduct.available),
        imageUrl
      };
      const response = await fetch(`${API_BASE}/api/products/${editProduct._id}`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || (lang==='bn'?'পণ্য আপডেট করা যায়নি।':'Unable to update product.'));
      setEditProductVisible(false);
      setEditProduct(null);
      await fetchOwnerInventory();
      if (selectedShop?._id && String(selectedShop._id) === String(data.data.shopId)) await fetchProducts(selectedShop._id);
      Alert.alert(lang === 'bn' ? 'পণ্য আপডেট হয়েছে' : 'Product updated', lang === 'bn' ? 'নাম, ছবি ও প্রাপ্যতা এখন ক্রেতার দিকেও আপডেট হবে।' : 'Name, photo and availability will now refresh on the customer side too.');
    } catch (error) { Alert.alert(lang==='bn'?'ইনভেন্টরি':'Inventory', error.message); }
    finally { setSavingProductEdit(false); }
  };

  const deleteProductMobile = () => {
    if (!editProduct?._id) return;
    Alert.alert(
      lang === 'bn' ? 'পণ্য ডিলিট করবেন?' : 'Delete product?',
      lang === 'bn' ? 'এটি inventory থেকে স্থায়ীভাবে মুছে যাবে।' : 'This will permanently remove it from inventory.',
      [
        { text: lang === 'bn' ? 'না' : 'Cancel', style: 'cancel' },
        { text: lang === 'bn' ? 'ডিলিট' : 'Delete', style: 'destructive', onPress: async () => {
          try {
            const response = await fetch(`${API_BASE}/api/products/${editProduct._id}`, { method: 'DELETE', headers: authHeaders() });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Unable to delete product.');
            setEditProductVisible(false); setEditProduct(null); await fetchOwnerInventory();
          } catch (error) { Alert.alert(L('ইনভেন্টরি','Inventory'), localError(error.message,'পণ্যটি মুছতে সমস্যা হয়েছে।','Unable to delete product.')); }
        }}
      ]
    );
  };

  const acceptRiderOffer = async (offer) => {
    try {
      const orderId = offer?.order?._id || offer?.orderId;
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/rider-offers/${offer._id}/accept`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: '{}' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to accept rider.');
      Alert.alert(L('রাইডার গ্রহণ করা হয়েছে','Rider accepted'), lang==='bn' ? `সংগ্রহ কোড: ${toBanglaDigits(data.data?.pickupCode || '')}` : `Pickup code: ${data.data?.pickupCode || ''}`);
      await fetchOwnerOrders();
      await fetchOwnerRiderOffers();
    } catch (e) { Alert.alert(L('রাইডার','Rider'), localError(e.message,'কাজটি সম্পন্ন করা যায়নি।','Unable to complete the action.')); }
  };

  const toggleShopAvailability = async () => {
    if (!ownerShop?._id) return;
    try {
      const next = !ownerShop.open;
      const res = await fetch(`${API_BASE}/api/shops/${ownerShop._id}/status`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ open: next }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to update shop availability.');
      setOwnerShop(data.data);
      await fetchNotifications();
    } catch (e) { Alert.alert(L('দোকানের প্রাপ্যতা','Shop availability'), localError(e.message,'দোকানের অবস্থা পরিবর্তন করা যায়নি।','Unable to update shop availability.')); }
  };

  useEffect(() => {
    if (role !== 'customer' && role !== 'rider') return undefined;
    refreshCurrentLocation({ silent: true });
    return undefined;
  }, [role, refreshCurrentLocation]);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 7000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    if (role !== 'customer') return undefined;
    fetchCustomerOrders();
    const timer = setInterval(fetchCustomerOrders, 6000);
    return () => clearInterval(timer);
  }, [role, fetchCustomerOrders]);

  useEffect(() => {
    if (role !== 'rider') return undefined;
    fetchRiderOrders();
    const timer = setInterval(fetchRiderOrders, 4000);
    return () => clearInterval(timer);
  }, [role, fetchRiderOrders]);

  useEffect(() => {
    if (role !== 'owner') return undefined;
    fetchOwnerRiderOffers();
    const timer = setInterval(fetchOwnerRiderOffers, 5000);
    return () => clearInterval(timer);
  }, [role, fetchOwnerRiderOffers]);


  useEffect(() => {
    if (role !== 'owner' || !ownerShop?._id) return undefined;
    fetchOwnerInventory();
    const timer = setInterval(fetchOwnerInventory, 8000);
    return () => clearInterval(timer);
  }, [role, ownerShop?._id, fetchOwnerInventory]);

  useEffect(() => {
    if (role === 'owner' && lowStockProducts.length > 0 && !lowStockReminderShown) {
      const timer = setTimeout(() => {
        showLowStockReminder();
        setLowStockReminderShown(true);
      }, 900);
      return () => clearTimeout(timer);
    }
    if (!lowStockProducts.length && lowStockReminderShown) setLowStockReminderShown(false);
    return undefined;
  }, [role, lowStockProducts.length, lowStockReminderShown, showLowStockReminder]);

  // Fetch Nearby Shops from API
  const fetchShops = useCallback(async () => {
    setLoadingShops(true);
    try {
      const res = await fetch(`${API_BASE}/api/shops/nearby?lat=${userCoords.latitude}&lng=${userCoords.longitude}&radius=${radius}`);
      if (res.ok) {
        const json = await res.json();
        setServerOnline(true);
        // Do not pretend demo shops are physically near the customer when the live geo query returns none.
        setShops(json.data || []);
        try {
          const mapRes = await fetch(`${API_BASE}/api/shops/available-map?lat=${userCoords.latitude}&lng=${userCoords.longitude}&radius=${radius}`);
          const mapJson = await mapRes.json();
          setMapShops(mapRes.ok && mapJson.success ? (mapJson.data || []) : (json.data || []).filter(shop => shop.open));
        } catch (mapError) {
          setMapShops((json.data || []).filter(shop => shop.open));
        }
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (e) {
      setServerOnline(false);
      const fallback = FALLBACK_SHOPS.filter(s => s.distanceMeters <= radius);
      setShops(fallback);
      setMapShops(fallback.filter(shop => shop.open && shop.location?.coordinates?.length === 2));
    } finally {
      setLoadingShops(false);
    }
  }, [radius, userCoords.latitude, userCoords.longitude]);

  useEffect(() => {
    fetchShops();
    if (role !== 'customer') return undefined;
    const timer = setInterval(fetchShops, 4000);
    return () => clearInterval(timer);
  }, [fetchShops, role]);

  // Fetch Products for Selected Shop
  const fetchProducts = useCallback(async (shopId) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_BASE}/api/shops/${shopId}/products`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setShopProducts(json.data);
        } else {
          setShopProducts(FALLBACK_PRODUCTS.filter(p => p.shopId === shopId));
        }
      } else {
        setShopProducts(FALLBACK_PRODUCTS.filter(p => p.shopId === shopId));
      }
    } catch (e) {
      setShopProducts(FALLBACK_PRODUCTS.filter(p => p.shopId === shopId));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Keep stock on an open shop screen fresh, including seller restocks from another device.
  useEffect(() => {
    if (!selectedShop?._id) return undefined;
    const timer = setInterval(() => fetchProducts(selectedShop._id), 4000);
    return () => clearInterval(timer);
  }, [selectedShop?._id, fetchProducts]);

  // Global "Find Product Near Me" Search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/search-near-me?query=${encodeURIComponent(query)}&lat=${userCoords.latitude}&lng=${userCoords.longitude}&radius=1000`);
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.data || []);
      } else {
        // Fallback local search
        const q = query.toLowerCase();
        const matches = FALLBACK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.nameBn.includes(q))
          .map(p => {
            const shop = FALLBACK_SHOPS.find(s => s._id === p.shopId) || FALLBACK_SHOPS[0];
            return {
              ...p,
              productName: p.name,
              productNameBn: p.nameBn,
              shopName: shop.shopName,
              shopNameBn: shop.shopNameBn,
              distanceMeters: shop.distanceMeters,
              shopOpen: shop.open,
              deliveryAvailable: shop.deliveryAvailable
            };
          });
        setSearchResults(matches);
      }
    } catch (e) {
      const q = query.toLowerCase();
      const matches = FALLBACK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.nameBn.includes(q))
        .map(p => {
          const shop = FALLBACK_SHOPS.find(s => s._id === p.shopId) || FALLBACK_SHOPS[0];
          return {
            ...p,
            productName: p.name,
            productNameBn: p.nameBn,
            shopName: shop.shopName,
            shopNameBn: shop.shopNameBn,
            distanceMeters: shop.distanceMeters,
            shopOpen: shop.open,
            deliveryAvailable: shop.deliveryAvailable
          };
        });
      setSearchResults(matches);
    }
  };

  // Multi-store cart operations. The same checkout can contain products from many shops.
  const addToCart = (product, shop) => {
    const nextShopId = String(shop ? shop._id : product.shopId);
    setCart(prev => {
      const existing = prev.find(item => String(item._id) === String(product._id));
      if (existing) {
        return prev.map(item => String(item._id) === String(product._id) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        ...product,
        quantity: 1,
        shopId: nextShopId,
        shopName: shop ? shop.shopName : product.shopName,
        shopNameBn: shop ? (shop.shopNameBn || shop.shopName) : (product.shopNameBn || product.shopName),
        shopDeliveryFee: Number(shop?.deliveryFee ?? product.deliveryFee ?? 20)
      }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item._id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const cartGroups = useMemo(() => {
    const map = new Map();
    cart.forEach(item => {
      const key = String(item.shopId);
      if (!map.has(key)) map.set(key, { shopId: key, shopName: item.shopName, shopNameBn: item.shopNameBn || item.shopName, deliveryFee: Number(item.shopDeliveryFee || 20), items: [] });
      map.get(key).items.push(item);
    });
    return [...map.values()];
  }, [cart]);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
    const deliveryFee = orderType === 'DELIVERY' ? cartGroups.reduce((sum, group) => sum + Number(group.deliveryFee || 20), 0) : 0;
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  }, [cart, cartGroups, orderType]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Submit one checkout. Backend splits it into one independent order per shop.
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const walletDigits = String(paymentSenderPhone || '').replace(/\D/g, '');
    if (paymentMethod !== 'CASH_ON_DELIVERY' && (walletDigits.length < 10 || walletDigits.length > 15)) {
      return Alert.alert(
        lang === 'bn' ? 'পেমেন্ট নম্বর দিন' : 'Wallet number required',
        lang === 'bn' ? 'যে bKash/Nagad/Upay নম্বর থেকে টাকা পাঠাবেন সেই নম্বরটি দিন।' : 'Enter the bKash/Nagad/Upay number you will pay from.'
      );
    }
    setSubmittingOrder(true);
    const groups = cartGroups.map(group => ({
      shopId: group.shopId,
      items: group.items.map(i => ({ productId: i._id || i.productId, quantity: i.quantity }))
    }));
    const payload = { groups, orderType, deliveryAddress: address, customerPhone: phone, paymentMethod };

    try {
      const res = await fetch(`${API_BASE}/api/orders/multi-store`, {
        method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Order could not be confirmed.');
      let orders = json.data?.orders || [];
      if (paymentMethod !== 'CASH_ON_DELIVERY') {
        const paidOrders = [];
        for (const order of orders) paidOrders.push(await processMobilePayment(order, paymentMethod));
        orders = paidOrders;
      }
      setCustomerOrders(prev => [...orders, ...prev.filter(existing => !orders.some(o => String(o._id) === String(existing._id)))]);
      setActiveOrder(orders[0] || null);
      setCart([]);
      setCartVisible(false);
      await fetchCustomerOrders();
      await fetchNotifications();
      Alert.alert(
        lang === 'bn' ? 'অর্ডার সফল' : 'Order placed',
        orders.length > 1
          ? (lang === 'bn' ? `${orders.length}টি দোকানের জন্য ${orders.length}টি আলাদা অর্ডার তৈরি হয়েছে।` : `${orders.length} separate shop orders were created.`)
          : (lang === 'bn' ? 'আপনার অর্ডার তৈরি হয়েছে।' : 'Your order was created.')
      );
      if (orders[0]) setTrackingVisible(true);
    } catch (e) {
      Alert.alert(lang === 'bn' ? 'অর্ডার হয়নি' : 'Order not confirmed', e.message);
    } finally { setSubmittingOrder(false); }
  };


  const processMobilePayment = async (order, method) => {
    try {
      const senderPhone = String(paymentSenderPhone || '').replace(/\D/g, '');
      const res = await fetch(`${API_BASE}/api/payments/initiate`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ orderId: order._id, method, senderPhone }) });
      const data = await res.json();
      if (!data.success) {
        Alert.alert(lang === 'bn' ? 'পেমেন্ট সেটআপ প্রয়োজন' : 'Payment setup required', data.message || 'Order is placed but payment is unpaid.');
        return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
      }
      if (data.demo) {
        const confirmRes = await fetch(`${API_BASE}/api/payments/${data.data._id}/demo-confirm`, { method: 'POST', headers: authHeaders() });
        const confirmed = await confirmRes.json();
        if (confirmed.success) {
          const trx = confirmed.payment?.transactionId || confirmed.data?.paymentTransactionId || '';
          Alert.alert(
            lang === 'bn' ? 'ডেমো পেমেন্ট সফল' : 'Demo payment successful',
            `${method} · ৳${order.totalPrice}${trx ? `\nTrxID: ${trx}` : ''}`
          );
          return confirmed.data;
        }
      }
    } catch (e) {
      Alert.alert(lang === 'bn' ? 'পেমেন্ট হয়নি' : 'Payment incomplete', e.message);
    }
    return { ...order, paymentMethod: method, paymentStatus: 'UNPAID' };
  };

  const loadOrderContact = async (order = activeOrder) => {
    if (!order?._id) return null;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/contact`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) { setOrderContact(data.data); return data.data; }
    } catch (e) {}
    return null;
  };

  const callOrderParty = async (order = activeOrder) => {
    const contact = await loadOrderContact(order);
    const target = role === 'owner' ? contact?.customer : contact?.shop;
    if (!target?.phone) return Alert.alert(lang === 'bn' ? 'নম্বর পাওয়া যায়নি' : 'Phone unavailable');
    Linking.openURL(`tel:${String(target.phone).replace(/\s+/g, '')}`);
  };

  const loadChat = async (order = activeOrder) => {
    if (!order?._id) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/messages`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setChatMessages(data.data || []);
    } catch (e) {}
  };

  const openChat = async (order = activeOrder) => {
    if (!order?._id) return;
    setActiveOrder(order);
    setChatVisible(true);
    await loadChat(order);
  };

  const sendChat = async () => {
    const text = chatText.trim();
    if (!text || !activeOrder?._id) return;
    setChatText('');
    try {
      const res = await fetch(`${API_BASE}/api/orders/${activeOrder._id}/messages`, { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ text }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await loadChat(activeOrder);
    } catch (e) { Alert.alert(L('চ্যাট','Chat'), localError(e.message,'বার্তা পাঠানো যায়নি।','Message not sent.')); }
  };

  // Poll active order
  const refreshActiveOrder = async () => {
    if (!activeOrder || !activeOrder._id) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const match = json.data.find(o => o._id === activeOrder._id || o.orderNumber === activeOrder.orderNumber);
          if (match) setActiveOrder(match);
        }
      }
    } catch (e) {
      // simulate progression
      const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      const curIdx = statuses.indexOf(activeOrder.status);
      if (curIdx >= 0 && curIdx < statuses.length - 1) {
        setActiveOrder({ ...activeOrder, status: statuses[curIdx + 1] });
      }
    }
  };

  useEffect(() => {
    if (!activeOrder?._id || activeOrder.status === 'DELIVERED' || activeOrder.status === 'CANCELLED') return undefined;
    const timer = setInterval(refreshActiveOrder, 8000);
    return () => clearInterval(timer);
  }, [activeOrder?._id, activeOrder?.status]);

  useEffect(() => {
    if (!chatVisible || !activeOrder?._id) return undefined;
    const timer = setInterval(() => loadChat(activeOrder), 5000);
    return () => clearInterval(timer);
  }, [chatVisible, activeOrder?._id]);

  const fetchOwnerAnalytics = useCallback(async () => {
    if (role !== 'owner' || !ownerShop?._id) return;
    setLoadingOwnerAnalytics(true);
    try {
      const res = await fetch(`${API_BASE}/api/seller/analytics?shopId=${ownerShop._id}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load analytics.');
      setOwnerAnalytics(data.data || null);
    } catch (e) {
      // Keep the last successful analytics snapshot on transient network errors.
    } finally {
      setLoadingOwnerAnalytics(false);
    }
  }, [role, ownerShop?._id, authHeaders]);

  const fetchOwnerPayments = useCallback(async () => {
    if (role !== 'owner' || !ownerShop?._id) return;
    setLoadingOwnerPayments(true);
    try {
      const res = await fetch(`${API_BASE}/api/seller/payments?shopId=${ownerShop._id}&limit=20`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load payment history.');
      const nextPayments = data.data || [];
      setOwnerPayments(nextPayments);
      const newest = nextPayments[0];
      if (!ownerPaymentsInitializedRef.current) {
        ownerPaymentsInitializedRef.current = true;
        lastSpokenPaymentIdRef.current = newest?._id || null;
      } else if (newest?._id && String(newest._id) !== String(lastSpokenPaymentIdRef.current || '')) {
        lastSpokenPaymentIdRef.current = newest._id;
        const bn = lang === 'bn';
        const methodLabel = bn
          ? (({ BKASH:'বিকাশ', NAGAD:'নগদ', UPAY:'উপায়' })[String(newest.method || '').toUpperCase()] || 'অনলাইন পেমেন্ট')
          : (({ BKASH:'bKash', NAGAD:'Nagad', UPAY:'Upay' })[String(newest.method || '').toUpperCase()] || newest.methodLabel || 'online payment');
        const speechText = bn
          ? `${newest.customerName || 'একজন ক্রেতা'} ${methodLabel} থেকে ${toBanglaDigits(newest.amount || 0)} টাকা পেমেন্ট করেছেন। প্রেরক নম্বরের শেষ তিন ডিজিট ${toBanglaDigits(newest.senderLast3 || '')}।`
          : `${newest.customerName || 'A customer'} has paid ${newest.amount || 0} taka using ${methodLabel}. The sender number ends in ${newest.senderLast3 || ''}.`;
        try {
          Speech.stop();
          Speech.speak(speechText, { language: bn ? 'bn-BD' : 'en-US', rate: bn ? 0.92 : 0.96, pitch: 1.0 });
        } catch (speechError) {
          // Transaction history still updates even if a device has no Bangla TTS voice installed.
        }
      }
    } catch (e) {
      // Keep the last successful transaction list on temporary network errors.
    } finally {
      setLoadingOwnerPayments(false);
    }
  }, [role, ownerShop?._id, authHeaders, lang]);

  const getCancelReasonOptions = (actor = role) => {
    if (actor === 'owner') {
      return lang === 'bn'
        ? ['পণ্য স্টকে নেই', 'দোকান বন্ধ হচ্ছে', 'অর্ডার প্রস্তুত করা সম্ভব নয়', 'ক্রেতা বাতিল করতে বলেছেন', 'ডেলিভারি সম্ভব নয়', 'অন্যান্য']
        : ['Out of stock', 'Shop is closing', 'Unable to prepare the order', 'Customer requested cancellation', 'Delivery unavailable', 'Other'];
    }
    return lang === 'bn'
      ? ['ভুল করে অর্ডার করেছি', 'পণ্য বা পরিমাণ ভুল হয়েছে', 'ডেলিভারি ঠিকানা ভুল', 'অর্ডারটি আর প্রয়োজন নেই', 'ডেলিভারিতে অনেক দেরি হচ্ছে', 'অন্যান্য']
      : ['Ordered by mistake', 'Wrong item or quantity', 'Wrong delivery address', 'Changed my mind', 'Delivery is taking too long', 'Other'];
  };

  const openCancelOrder = (order, actor = role) => {
    if (!order?._id) return;
    if (actor === 'customer' && !['PLACED', 'ACCEPTED'].includes(String(order.status || '').toUpperCase())) {
      return Alert.alert(
        lang === 'bn' ? 'বাতিল করা যাবে না' : 'Cancellation closed',
        lang === 'bn' ? 'দোকানদার পণ্য প্রস্তুত করা শুরু করার পর ক্রেতা অর্ডার বাতিল করতে পারবেন না।' : 'Customers can cancel only before the seller starts preparing the order.'
      );
    }
    setCancelOrderTarget({ ...order, cancelActor: actor });
    setCancelReason('');
    setCancelReasonCustom('');
    setCancelVisible(true);
  };

  const submitOrderCancellation = async () => {
    if (!cancelOrderTarget?._id) return;
    const selected = cancelReason.trim();
    const custom = cancelReasonCustom.trim();
    const isOther = ['Other', 'অন্যান্য'].includes(selected);
    const reason = isOther ? custom : (selected ? (custom ? `${selected}: ${custom}` : selected) : custom);
    if (!reason) return Alert.alert(lang === 'bn' ? 'কারণ দিন' : 'Reason required', lang === 'bn' ? 'অর্ডার বাতিল করার কারণ নির্বাচন বা লিখুন।' : 'Please select or enter a cancellation reason.');
    try {
      const res = await fetch(`${API_BASE}/api/orders/${cancelOrderTarget._id}/cancel`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to cancel order.');
      setCancelVisible(false);
      setCancelOrderTarget(null);
      if (role === 'customer') await fetchCustomerOrders();
      if (role === 'owner') {
        await fetchOwnerOrders();
        await fetchOwnerAnalytics();
        await fetchOwnerPayments();
      }
      if (activeOrder?._id === data.data?._id) setActiveOrder(data.data);
      Alert.alert(lang === 'bn' ? 'অর্ডার বাতিল হয়েছে' : 'Order cancelled', `${lang === 'bn' ? 'কারণ' : 'Reason'}: ${reason}`);
    } catch (e) {
      Alert.alert(lang === 'bn' ? 'বাতিল করা যায়নি' : 'Unable to cancel', e.message || 'Please try again.');
    }
  };

  // Fetch Owner Orders
  const fetchOwnerOrders = async () => {
    setLoadingOwnerOrders(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        setOwnerOrders(json.data || []);
      }
    } catch (e) {
      setOwnerOrders([
        {
          _id: '65e01a2b8c9d4e001f11a062',
          orderNumber: 'KD-20260901-002',
          shopName: 'Rahman Grocery',
          items: [{ productName: 'Farm Fresh Brown Eggs', unit: '12 pcs', price: 155, quantity: 1 }],
          totalPrice: 230,
          status: 'PREPARING',
          deliveryAddress: 'House 12, Road 4, Sector 3, Uttara, Dhaka'
        }
      ]);
    } finally {
      setLoadingOwnerOrders(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: newStatus })
      });
      await fetchOwnerOrders();
      await fetchOwnerAnalytics();
      await fetchOwnerPayments();
    } catch (e) {
      setOwnerOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  useEffect(() => {
    if (role !== 'owner') return undefined;
    fetchOwnerOrders();
    fetchOwnerAnalytics();
    fetchOwnerPayments();
    const refreshTimer = setInterval(() => { fetchOwnerOrders(); fetchOwnerAnalytics(); fetchOwnerPayments(); }, 10000);
    return () => clearInterval(refreshTimer);
  }, [role, token, ownerShop?._id]);

  // Open shop details
  const openShop = (shop) => {
    setSelectedShop(shop);
    setSelectedCategory('all');
    fetchProducts(shop._id);
  };

  const shopCategories = useMemo(() => {
    const actual = [...new Set(shopProducts.map(p => String(p.category || 'Groceries').trim()).filter(Boolean))].sort();
    return [
      { id: 'all', nameEn: 'All Items', nameBn: 'সব পণ্য', icon: '🛒' },
      ...actual.map(category => { const known=PRODUCT_CATEGORIES.find(item=>item.value===category); return { id:category, nameEn:known?.en || category, nameBn:known?.bn || category, icon:'•' }; })
    ];
  }, [shopProducts]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !shopCategories.some(cat => cat.id === selectedCategory)) setSelectedCategory('all');
  }, [shopCategories, selectedCategory]);

  const filteredShopProducts = useMemo(() => {
    if (selectedCategory === 'all') return shopProducts;
    return shopProducts.filter(p => p.category === selectedCategory);
  }, [shopProducts, selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor="#0f172a" />

      {/* 1. Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandIcon}>🏪</Text>
              <Text style={styles.brandTitle}>{t.appName}</Text>
            </View>
            <Text style={styles.tagline}>{t.tagline}</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Lang toggle */}
            <TouchableOpacity
              style={styles.langBtn}
              onPress={() => changeLanguage(lang === 'bn' ? 'en' : 'bn')}
            >
              <Text style={styles.langBtnText}>{lang === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 EN'}</Text>
            </TouchableOpacity>

            {/* Cart Badge Button */}
            <TouchableOpacity
              style={styles.cartHeaderBtn}
              onPress={() => setCartVisible(true)}
            >
              <Text style={styles.cartIconText}>🛍️</Text>
              {totalCartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalCartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartHeaderBtn} onPress={() => { setNotificationsVisible(true); markNotificationsRead(); }}>
              <Text style={styles.cartIconText}>🔔</Text>
              {notificationUnread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{notificationUnread > 99 ? '99+' : notificationUnread}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutHeaderBtn} onPress={onLogout}>
              <Text style={styles.logoutHeaderText}>↪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location & Server Status Bar */}
        <View style={styles.locationBar}>
          <Text style={styles.locationText} numberOfLines={1}>📍 {role === 'owner' ? (ownerShop?.address || profileAddress || t.locationPill) : locationLabel}</Text>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: serverOnline ? '#10b981' : '#f59e0b' }]} />
            <Text style={styles.statusText}>{serverOnline ? 'Live DB' : 'Offline/Local'}</Text>
          </View>
        </View>

        {/* Authenticated role */}
        <View style={styles.roleBar}>
          <TouchableOpacity style={[styles.roleTab, styles.roleTabActive]} onPress={() => setProfileVisible(true)}>
            <Text style={[styles.roleTabText, styles.roleTabTextActive]}>
              {role === 'owner' ? '🏪 Shop Owner' : role === 'rider' ? '🛵 Rider' : '🛒 Customer'} · {user?.name || ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Customer View — optimized for small screens using Shneiderman's Golden Rules */}
      {role === 'customer' ? (
        <View style={styles.customerShell}>
          <ScrollView style={styles.mainScroll} contentContainerStyle={styles.customerScrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {customerScreen === 'home' ? (
              <>
                {/* Active order gives immediate, informative feedback without forcing the user to remember status. */}
                {activeOrder && (
                  <TouchableOpacity style={styles.activeOrderBanner} onPress={() => setTrackingVisible(true)} activeOpacity={0.85}>
                    <View style={styles.activeOrderLeft}>
                      <Text style={styles.pulseIcon}>⚡</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activeOrderTitle}>{lang === 'bn' ? 'চলমান অর্ডার' : 'Active Order'} · {activeOrder.orderNumber || activeOrder._id}</Text>
                        <Text style={styles.activeOrderStatus}>{lang === 'bn' ? 'অবস্থা' : 'Status'}: <Text style={styles.statusHighlight}>{activeOrder.status}</Text></Text>
                      </View>
                    </View>
                    <Text style={styles.trackOrderArrow}>›</Text>
                  </TouchableOpacity>
                )}
                {activeOrder && ['PLACED', 'ACCEPTED'].includes(String(activeOrder.status || '').toUpperCase()) && (
                  <View style={styles.customerCancelWindow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerCancelWindowTitle}>💡 {lang === 'bn' ? 'দোকানদার প্রস্তুতি শুরু করার আগে বাতিল করতে পারবেন' : 'You can cancel before the seller starts preparing'}</Text>
                      <Text style={styles.customerCancelWindowSub}>{lang === 'bn' ? 'যেমন: ভুল অর্ডার, ভুল পরিমাণ বা ঠিকানা সমস্যা।' : 'Suggested reasons: ordered by mistake, wrong quantity, or address issue.'}</Text>
                    </View>
                    <TouchableOpacity style={styles.customerCancelWindowBtn} onPress={() => openCancelOrder(activeOrder, 'customer')}>
                      <Text style={styles.customerCancelWindowBtnText}>{lang === 'bn' ? 'বাতিল' : 'Cancel'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Current location card: real device GPS, clear state, refresh and map controls. */}
                <View style={styles.currentLocationCard}>
                  <View style={styles.locationCardIconWrap}><Text style={styles.locationCardIcon}>📍</Text></View>
                  <View style={styles.locationCardBody}>
                    <Text style={styles.locationCardKicker}>{lang === 'bn' ? 'আপনার বর্তমান লোকেশন' : 'Your current location'}</Text>
                    <Text style={styles.locationCardTitle} numberOfLines={2}>{locationLabel}</Text>
                    <Text style={styles.locationCardMeta}>
                      {locationStatus === 'loading'
                        ? (lang === 'bn' ? 'GPS লোকেশন নেওয়া হচ্ছে…' : 'Getting GPS location…')
                        : locationStatus === 'ready'
                          ? `${userCoords.latitude.toFixed(5)}, ${userCoords.longitude.toFixed(5)}${locationAccuracy ? ` · ±${Math.round(locationAccuracy)}m` : ''}`
                          : locationStatus === 'demo'
                            ? (lang === 'bn' ? 'ডেমো লোকেশন সক্রিয়' : 'Demo location active')
                            : (lang === 'bn' ? 'কাছের দোকান সঠিকভাবে দেখতে লোকেশন চালু করুন' : 'Turn on location for accurate nearby shops')}
                    </Text>
                  </View>
                  {locationStatus === 'loading' ? <ActivityIndicator color="#10b981" /> : <TouchableOpacity style={styles.locationRefreshBtn} onPress={() => refreshCurrentLocation()}><Text style={styles.locationRefreshText}>↻</Text></TouchableOpacity>}
                </View>
                <View style={styles.locationActionRow}>
                  <TouchableOpacity style={styles.locationSecondaryBtn} onPress={openCurrentLocationMap}><Text style={styles.locationSecondaryText}>🗺️ {lang === 'bn' ? 'ম্যাপে দেখুন' : 'View map'}</Text></TouchableOpacity>
                  {(locationStatus === 'denied' || locationStatus === 'error') && <TouchableOpacity style={styles.locationSecondaryBtn} onPress={useDemoLocation}><Text style={styles.locationSecondaryText}>🏙️ {lang === 'bn' ? 'ডেমো লোকেশন' : 'Use demo'}</Text></TouchableOpacity>}
                </View>

                <View style={styles.availableMapCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}><Text style={styles.sectionHeading}>🗺️ {lang === 'bn' ? 'ম্যাপে Available দোকান' : 'Available shops on map'}</Text><Text style={styles.sectionSubtle}>{lang === 'bn' ? 'শুধু খোলা ও স্টকে পণ্য থাকা দোকান' : 'Only open shops with products in stock'}</Text></View>
                    <View style={styles.shopCountPill}><Text style={styles.shopCountPillText}>{mapShops.length}</Text></View>
                  </View>
                  {Platform.OS === 'web' ? (
                    <TouchableOpacity style={styles.mapWebFallback} onPress={openCurrentLocationMap}><Text style={styles.locationSecondaryText}>{lang === 'bn' ? 'ব্রাউজারে ম্যাপ খুলুন' : 'Open map in browser'}</Text></TouchableOpacity>
                  ) : (
                    <MapView
                      style={styles.customerMap}
                      region={{ latitude: userCoords.latitude, longitude: userCoords.longitude, latitudeDelta: radius <= 200 ? 0.006 : 0.018, longitudeDelta: radius <= 200 ? 0.006 : 0.018 }}
                      showsUserLocation={locationStatus === 'ready'}
                      showsMyLocationButton
                    >
                      <Circle center={userCoords} radius={radius} strokeColor="rgba(16,185,129,0.8)" fillColor="rgba(16,185,129,0.10)" />
                      {mapShops.map(shop => {
                        const coordinates = shop.location?.coordinates || [];
                        if (coordinates.length < 2) return null;
                        return <Marker key={`map-${shop._id}`} coordinate={{ latitude: Number(coordinates[1]), longitude: Number(coordinates[0]) }} title={lang === 'bn' ? (shop.shopNameBn || shop.shopName) : shop.shopName} description={`${Math.round(Number(shop.distanceMeters || 0))}m · ${shop.address || ''}`} pinColor="#10b981" onPress={() => openShop(shop)} />;
                      })}
                    </MapView>
                  )}
                </View>

                {/* Search is the primary task, placed before secondary information. */}
                <View style={styles.customerSectionHeaderCompact}>
                  <Text style={styles.customerSectionTitle}>{lang === 'bn' ? 'কী কিনতে চান?' : 'What do you need?'}</Text>
                  <Text style={styles.customerSectionHint}>{lang === 'bn' ? 'পণ্য বা দোকান খুঁজুন' : 'Search products nearby'}</Text>
                </View>
                <View style={styles.searchContainer}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput style={styles.searchInput} placeholder={t.searchPlaceholder} placeholderTextColor="#64748b" value={searchQuery} onChangeText={handleSearch} returnKeyType="search" />
                  {searchQuery.length > 0 && <TouchableOpacity onPress={() => handleSearch('')} accessibilityLabel="Clear search"><Text style={styles.clearSearch}>✕</Text></TouchableOpacity>}
                </View>

                {searching && (
                  <View style={styles.searchResultsBox}>
                    <View style={styles.sectionHeaderRow}><Text style={styles.sectionHeading}>{lang === 'bn' ? `ফলাফল (${searchResults.length})` : `Results (${searchResults.length})`}</Text><Text style={styles.feedbackText}>{serverOnline ? '● Live' : '● Local'}</Text></View>
                    {searchResults.length === 0 ? <Text style={styles.emptyText}>{lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।' : 'No products found. Try another search.'}</Text> : searchResults.map(item => {
                      const cartItem = cart.find(c => String(c._id) === String(item._id || item.productId));
                      return (
                        <View key={item._id || item.productId} style={styles.searchResultCard}>
                          <Image source={{ uri: mediaUrl(item.imageUrl) }} style={styles.searchImg} />
                          <View style={styles.searchInfo}>
                            <Text style={styles.searchProdName} numberOfLines={1}>{lang === 'bn' ? (item.productNameBn || item.productName) : item.productName}</Text>
                            <Text style={styles.searchShopName} numberOfLines={1}>🏪 {lang === 'bn' ? (item.shopNameBn || item.shopName) : item.shopName} · {item.distanceMeters ?? '—'}m</Text>
                            <Text style={styles.searchPrice}>৳{item.price} / {item.unit}</Text>
                          </View>
                          {cartItem ? (
                            <View style={styles.inlineQtyCompact}>
                              <TouchableOpacity style={styles.inlineQtyBtnCompact} onPress={() => updateQuantity(cartItem._id, -1)}><Text style={styles.inlineQtyTextCompact}>−</Text></TouchableOpacity>
                              <Text style={styles.inlineQtyValueCompact}>{cartItem.quantity}</Text>
                              <TouchableOpacity style={styles.inlineQtyBtnCompact} onPress={() => updateQuantity(cartItem._id, 1)}><Text style={styles.inlineQtyTextCompact}>+</Text></TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity style={styles.addBtnSmall} onPress={() => addToCart(item, { _id: item.shopId, shopName: item.shopName, shopNameBn: item.shopNameBn, deliveryFee: item.deliveryFee || 20 })}><Text style={styles.addBtnSmallText}>+ {lang === 'bn' ? 'যোগ' : 'Add'}</Text></TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Distance control uses one consistent selection pattern. */}
                <View style={styles.radiusSection}>
                  <View style={styles.sectionHeaderRow}>
                    <View><Text style={styles.sectionHeading}>{t.radiusHeader}</Text><Text style={styles.sectionSubtle}>{lang === 'bn' ? 'আপনার GPS লোকেশন থেকে দূরত্ব' : 'Distance from your GPS location'}</Text></View>
                  </View>
                  <View style={styles.radiusRow}>
                    {[100, 200, 500, 1000].map(r => (
                      <TouchableOpacity key={r} style={[styles.radiusChip, radius === r && styles.radiusChipActive]} onPress={() => setRadius(r)} accessibilityState={{ selected: radius === r }}>
                        <Text style={[styles.radiusChipText, radius === r && styles.radiusChipTextActive]}>{r >= 1000 ? '1 km' : `${r}m`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.shopsSection}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}><Text style={styles.sectionHeading}>{t.nearbyShops}</Text><Text style={styles.sectionSubtle}>{lang === 'bn' ? 'দূরত্ব অনুযায়ী সাজানো' : 'Sorted by distance'}</Text></View>
                    <View style={styles.shopCountPill}><Text style={styles.shopCountPillText}>{shops.length}</Text></View>
                  </View>

                  {loadingShops ? (
                    <View style={styles.loadingState}><ActivityIndicator size="large" color="#10b981" /><Text style={styles.loadingStateText}>{lang === 'bn' ? 'কাছের দোকান খোঁজা হচ্ছে…' : 'Finding nearby shops…'}</Text></View>
                  ) : shops.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>📍</Text>
                      <Text style={styles.emptyStateTitle}>{lang === 'bn' ? 'এই দূরত্বে কোনো দোকান নেই' : 'No shops in this radius'}</Text>
                      <Text style={styles.emptyText}>{lang === 'bn' ? 'পরিধি বাড়াতে পারেন, লোকেশন রিফ্রেশ করতে পারেন, অথবা ডেমোর জন্য উত্তরা লোকেশন ব্যবহার করতে পারেন।' : 'Increase the radius, refresh your location, or use the Uttara demo location.'}</Text>
                      <View style={styles.emptyActionRow}>
                        <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={() => setRadius(1000)}><Text style={styles.emptyPrimaryText}>{lang === 'bn' ? '১ কিমি দেখুন' : 'Try 1 km'}</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.emptySecondaryBtn} onPress={useDemoLocation}><Text style={styles.emptySecondaryText}>{lang === 'bn' ? 'ডেমো লোকেশন' : 'Demo location'}</Text></TouchableOpacity>
                      </View>
                    </View>
                  ) : shops.map(shop => (
                    <TouchableOpacity key={shop._id} style={styles.shopCard} activeOpacity={0.88} onPress={() => openShop(shop)}>
                      <Image source={{ uri: mediaUrl(shop.ownerImageUrl || shop.imageUrl) }} style={styles.shopImg} />
                      <View style={styles.shopBadgesRow}>
                        <View style={styles.distancePill}><Text style={styles.distancePillText}>📍 {Math.round(Number(shop.distanceMeters || 0))}m</Text></View>
                        <View style={[styles.openPill, { backgroundColor: shop.open ? '#059669' : '#dc2626' }]}><Text style={styles.openPillText}>{shop.open ? t.openBadge : t.closedBadge}</Text></View>
                      </View>
                      <View style={styles.shopDetails}>
                        <Text style={styles.shopName} numberOfLines={1}>{lang === 'bn' ? (shop.shopNameBn || shop.shopName) : shop.shopName}</Text>
                        <Text style={styles.shopDesc} numberOfLines={2}>{shop.description}</Text>
                        <Text style={styles.shopAddress} numberOfLines={1}>📍 {shop.address}</Text>
                        <View style={styles.shopMetaRow}>
                          <Text style={styles.ratingText}>⭐ {shop.rating || 0} ({shop.totalRatings || 0})</Text>
                          <Text style={styles.deliveryText}>🛵 {shop.deliveryAvailable ? `৳${shop.deliveryFee || 0}` : t.pickupOnly}</Text>
                        </View>
                        <View style={[styles.viewShopBtn, !shop.open && styles.viewShopBtnMuted]}><Text style={[styles.viewShopBtnText, !shop.open && styles.viewShopBtnTextMuted]}>{shop.open ? (lang === 'bn' ? 'দোকান খুলুন  ›' : 'Open shop  ›') : (lang === 'bn' ? 'বন্ধ — পণ্য দেখুন' : 'Closed — view catalog')}</Text></View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.ordersScreenSection}>
                <View style={styles.ordersScreenHeader}>
                  <View><Text style={styles.ordersScreenTitle}>{lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</Text><Text style={styles.sectionSubtle}>{lang === 'bn' ? 'প্রতিটি দোকানের অর্ডার আলাদা ট্র্যাক করুন' : 'Track each shop order separately'}</Text></View>
                  <TouchableOpacity style={styles.iconRefreshButton} onPress={fetchCustomerOrders}><Text style={styles.iconRefreshText}>↻</Text></TouchableOpacity>
                </View>
                {loadingCustomerOrders ? <View style={styles.loadingState}><ActivityIndicator color="#10b981" /><Text style={styles.loadingStateText}>{lang === 'bn' ? 'অর্ডার লোড হচ্ছে…' : 'Loading orders…'}</Text></View> : customerOrders.length === 0 ? <View style={styles.emptyBox}><Text style={styles.emptyIcon}>🧾</Text><Text style={styles.emptyStateTitle}>{lang === 'bn' ? 'এখনও কোনো অর্ডার নেই' : 'No orders yet'}</Text><Text style={styles.emptyText}>{lang === 'bn' ? 'হোমে ফিরে কাছের দোকান থেকে কেনাকাটা করুন।' : 'Go Home and shop from a nearby store.'}</Text></View> : customerOrders.map(order => (
                  <View key={order._id} style={styles.mobileOrderMiniCard}>
                    <View style={styles.orderCardHeader}><Text style={styles.orderIdText}>{order.orderNumber}</Text><Text style={styles.orderStatusBadge}>{order.status}</Text></View>
                    <Text style={styles.mobileOrderShop}>🏪 {lang === 'bn' ? (order.shopNameBn || order.shopName) : order.shopName}</Text>
                    <Text style={styles.orderItemRow} numberOfLines={2}>{(order.items || []).map(i => `${lang === 'bn' ? (i.productNameBn || i.productName) : i.productName} × ${i.quantity}`).join(', ')}</Text>
                    <View style={styles.orderSummaryRow}><Text style={styles.orderTotalText}>৳{order.totalPrice}</Text><Text style={styles.orderTypePill}>{order.orderType}</Text></View>
                    {order.acceptedRiderName ? <View style={styles.sharedProfileMiniRow}>{order.acceptedRiderImageUrl ? <Image source={{ uri: mediaUrl(order.acceptedRiderImageUrl) }} style={styles.sharedProfileMiniAvatar} /> : <Text style={styles.sharedProfileMiniFallback}>🛵</Text>}<View><Text style={styles.sharedProfileMiniName}>{order.acceptedRiderName}</Text><Text style={styles.riderMeta}>{lang === 'bn' ? 'নির্ধারিত রাইডার' : 'Assigned Rider'}</Text></View></View> : order.orderType === 'DELIVERY' ? <Text style={styles.riderMeta}>🛵 {lang === 'bn' ? 'রাইডারের অপেক্ষায়' : 'Waiting for rider'}</Text> : null}
                    {order.cancellationReason ? <View style={styles.cancelReasonBox}><Text style={styles.cancelReasonText}>⛔ {lang === 'bn' ? 'বাতিলের কারণ' : 'Cancellation reason'}: {order.cancellationReason}</Text></View> : null}
                    <View style={styles.communicationRow}>
                      <TouchableOpacity style={styles.communicationPrimary} onPress={() => { setActiveOrder(order); setTrackingVisible(true); }}><Text style={styles.communicationPrimaryText}>📍 {lang === 'bn' ? 'ট্র্যাক' : 'Track'}</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.communicationSecondary} onPress={() => openChat(order)}><Text style={styles.communicationSecondaryText}>💬 {lang === 'bn' ? 'চ্যাট' : 'Chat'}</Text></TouchableOpacity>
                    </View>
                    {['PLACED','ACCEPTED'].includes(String(order.status || '').toUpperCase()) ? (
                      <View style={styles.cancelEligibilityBox}>
                        <Text style={styles.cancelEligibilityText}>💡 {lang === 'bn' ? 'দোকানদার PREPARING শুরু করার আগে আপনি বাতিল করতে পারবেন। একটি কারণ নির্বাচন করতে হবে।' : 'You may cancel before the seller starts PREPARING. You will be asked to choose a reason.'}</Text>
                        <TouchableOpacity style={styles.cancelOrderButton} onPress={() => openCancelOrder(order, 'customer')}><Text style={styles.cancelOrderButtonText}>✕ {lang === 'bn' ? 'কারণ দিয়ে অর্ডার বাতিল' : 'Cancel with reason'}</Text></TouchableOpacity>
                      </View>
                    ) : String(order.status || '').toUpperCase() === 'PREPARING' ? (
                      <Text style={styles.cancelClosedText}>🔒 {lang === 'bn' ? 'দোকানদার পণ্য প্রস্তুত করা শুরু করেছেন — এখন ক্রেতার বাতিলের সুযোগ বন্ধ।' : 'Seller has started preparing — customer cancellation is now closed.'}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Persistent shortcuts: consistency + frequent-user shortcuts + user control. */}
          <View style={styles.customerBottomNav}>
            <TouchableOpacity style={styles.customerNavItem} onPress={() => setCustomerScreen('home')}><Text style={[styles.customerNavIcon, customerScreen === 'home' && styles.customerNavActive]}>⌂</Text><Text style={[styles.customerNavLabel, customerScreen === 'home' && styles.customerNavLabelActive]}>{lang === 'bn' ? 'হোম' : 'Home'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.customerNavItem} onPress={() => { setCustomerScreen('orders'); fetchCustomerOrders(); }}><View><Text style={[styles.customerNavIcon, customerScreen === 'orders' && styles.customerNavActive]}>▤</Text>{customerOrders.some(o => !['DELIVERED','COMPLETED','CANCELLED'].includes(String(o.status || '').toUpperCase())) && <View style={styles.navDot} />}</View><Text style={[styles.customerNavLabel, customerScreen === 'orders' && styles.customerNavLabelActive]}>{lang === 'bn' ? 'অর্ডার' : 'Orders'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.customerNavItem} onPress={() => setCartVisible(true)}><View><Text style={styles.customerNavIcon}>🛍</Text>{totalCartCount > 0 && <View style={styles.navBadge}><Text style={styles.navBadgeText}>{totalCartCount > 9 ? '9+' : totalCartCount}</Text></View>}</View><Text style={styles.customerNavLabel}>{lang === 'bn' ? 'কার্ট' : 'Cart'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.customerNavItem} onPress={() => setProfileVisible(true)}><Text style={styles.customerNavIcon}>◉</Text><Text style={styles.customerNavLabel}>{lang === 'bn' ? 'প্রোফাইল' : 'Profile'}</Text></TouchableOpacity>
          </View>
        </View>
      ) : role === 'owner' ? (
        /* 3. Shop Owner View */
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.ownerHeaderCard}>
            <View style={styles.ownerProfileRow}>
              {profileImage ? <Image source={{ uri: mediaUrl(profileImage) }} style={styles.ownerProfileImage} /> : <Text style={styles.ownerProfileIcon}>🏪</Text>}
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerTitle}>{ownerShop?.shopName || (lang==='bn' ? `${user?.name || 'দোকানদার'}-এর দোকান` : `${user?.name || 'Shop Owner'}'s Store`)}</Text>
                <Text style={styles.ownerSub}>{ownerShop?.address || (lang === 'bn' ? 'আপনার দোকান প্রোফাইল' : 'Your shop profile')}</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileVisible(true)}><Text style={styles.refreshLink}>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.availabilityButton, ownerShop?.open ? styles.availabilityOn : styles.availabilityOff]} onPress={toggleShopAvailability}>
              <Text style={styles.availabilityText}>{ownerShop?.open ? (lang === 'bn' ? '🟢 দোকান খোলা' : '🟢 Shop Available') : (lang === 'bn' ? '🔴 দোকান বন্ধ' : '🔴 Shop Unavailable')}</Text>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{ownerOrders.length}</Text>
                <Text style={styles.statLbl}>{lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#f59e0b' }]}>
                  {ownerOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
                </Text>
                <Text style={styles.statLbl}>{lang === 'bn' ? 'প্রক্রিয়াধীন' : 'Pending'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#10b981' }]}>
                  ৳{ownerOrders.filter(o => o.status === 'DELIVERED').reduce((a, c) => a + c.totalPrice, 0)}
                </Text>
                <Text style={styles.statLbl}>{lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.analyticsMobileCard}>
            <View style={styles.sectionHeaderRow}>
              <View><Text style={styles.sectionHeading}>📊 {lang === 'bn' ? 'বিক্রয় বিশ্লেষণ' : 'Seller Analytics'}</Text><Text style={styles.sectionSubtle}>{lang === 'bn' ? 'বাস্তব অর্ডার থেকে হিসাব' : 'Calculated from real orders'}</Text></View>
              <TouchableOpacity onPress={fetchOwnerAnalytics}><Text style={styles.refreshLink}>↻</Text></TouchableOpacity>
            </View>
            {loadingOwnerAnalytics && !ownerAnalytics ? <ActivityIndicator color="#10b981" /> : <>
              <View style={styles.analyticsMetricGridMobile}>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'আজকের বিক্রয়' : 'Today'}</Text><Text style={styles.analyticsMetricValue}>৳{Math.round(ownerAnalytics?.summary?.todayRevenue || 0)}</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'এই সপ্তাহ' : 'This Week'}</Text><Text style={styles.analyticsMetricValue}>৳{Math.round(ownerAnalytics?.summary?.weekRevenue || 0)}</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'এই মাস' : 'This Month'}</Text><Text style={styles.analyticsMetricValue}>৳{Math.round(ownerAnalytics?.summary?.monthRevenue || 0)}</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'সম্পন্ন' : 'Completed'}</Text><Text style={styles.analyticsMetricValue}>{ownerAnalytics?.summary?.completedOrders || 0}</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'বাতিল' : 'Cancelled'}</Text><Text style={[styles.analyticsMetricValue, { color: '#ef4444' }]}>{ownerAnalytics?.summary?.cancelledOrders || 0}</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'গড় অর্ডার' : 'Avg Order'}</Text><Text style={styles.analyticsMetricValue}>৳{Math.round(ownerAnalytics?.summary?.averageOrderValue || 0)}</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'সফলতার হার' : 'Fulfillment'}</Text><Text style={styles.analyticsMetricValue}>{ownerAnalytics?.summary?.fulfillmentRate || 0}%</Text></View>
                <View style={styles.analyticsMetricMobile}><Text style={styles.analyticsMetricLabel}>{lang === 'bn' ? 'লো স্টক' : 'Low Stock'}</Text><Text style={[styles.analyticsMetricValue, { color: '#f59e0b' }]}>{ownerAnalytics?.lowStockCount || 0}</Text></View>
              </View>
              <Text style={[styles.formLabel, { marginTop: 12 }]}>{lang === 'bn' ? 'সেরা বিক্রি হওয়া পণ্য' : 'Top-selling products'}</Text>
              {(ownerAnalytics?.topProducts || []).length === 0 ? <Text style={styles.emptyText}>{lang === 'bn' ? 'এখনও সম্পন্ন বিক্রয় নেই।' : 'No completed sales yet.'}</Text> : (ownerAnalytics?.topProducts || []).slice(0, 3).map((item, idx) => <View key={`${item.productId}-${idx}`} style={styles.analyticsProductMobile}><Text style={styles.analyticsRankMobile}>{idx + 1}</Text><Text style={styles.analyticsProductNameMobile} numberOfLines={1}>{lang === 'bn' ? (item.nameBn || item.name) : item.name}</Text><Text style={styles.analyticsProductQtyMobile}>{item.quantity} {lang === 'bn' ? 'বিক্রি' : 'sold'}</Text></View>)}
            </>}
          </View>

          <View style={styles.analyticsMobileCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>💳 {lang === 'bn' ? 'অনলাইন পেমেন্ট হিস্ট্রি' : 'Online Payment History'}</Text>
                <Text style={styles.sectionSubtle}>{lang === 'bn' ? 'TrxID ও প্রেরক নম্বরের শেষ ৩ ডিজিট' : 'TrxID and last 3 digits of sender number'}</Text>
              </View>
              <TouchableOpacity onPress={fetchOwnerPayments}><Text style={styles.refreshLink}>↻</Text></TouchableOpacity>
            </View>
            {loadingOwnerPayments && ownerPayments.length === 0 ? (
              <ActivityIndicator color="#10b981" />
            ) : ownerPayments.length === 0 ? (
              <Text style={styles.emptyText}>{lang === 'bn' ? 'এখনও কোনো সফল অনলাইন পেমেন্ট নেই।' : 'No successful online payments yet.'}</Text>
            ) : ownerPayments.slice(0, 10).map(payment => (
              <View key={payment._id} style={styles.paymentHistoryMobileRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentHistoryMobileName}>{payment.customerName} · {payment.methodLabel || payment.method}</Text>
                  <Text style={styles.paymentHistoryMobileMeta}>{lang==='bn'?'অর্ডার':'Order'} #{payment.orderNumber} · {lang==='bn'?'শেষ ৩ ডিজিট':'last 3'} •••{payment.senderLast3 || '---'}</Text>
                  <Text style={styles.paymentHistoryMobileTrx}>TrxID: {payment.transactionId || '—'}</Text>
                </View>
                <Text style={styles.paymentHistoryMobileAmount}>৳{payment.amount}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ownerInventoryCardMobile}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1 }}><Text style={styles.sectionHeading}>📦 {lang === 'bn' ? 'ইনভেন্টরি ব্যবস্থাপনা' : 'Inventory Management'}</Text><Text style={styles.sectionSubtle}>{lang === 'bn' ? 'পণ্যের নাম, ছবি, দাম, স্টক ও প্রাপ্যতা পরিচালনা করুন' : 'Manage product name, photo, price, stock and availability'}</Text></View>
              <View style={{flexDirection:'row',gap:8,alignItems:'center'}}><TouchableOpacity style={styles.inventoryAddButtonMobile} onPress={() => { resetNewProduct(); setAddProductVisible(true); }}><Text style={styles.inventoryAddButtonText}>＋ {lang === 'bn' ? 'পণ্য' : 'Product'}</Text></TouchableOpacity><TouchableOpacity onPress={fetchOwnerInventory}><Text style={styles.refreshLink}>↻</Text></TouchableOpacity></View>
            </View>
            {loadingOwnerProducts && ownerProducts.length === 0 ? <ActivityIndicator color="#10b981" /> : ownerProducts.length === 0 ? <Text style={styles.emptyText}>{lang === 'bn' ? 'কোনো পণ্য নেই।' : 'No products in inventory.'}</Text> : ownerProducts.map(product => (
              <View key={`inventory-${product._id}`} style={styles.ownerInventoryProductMobile}>
                <Image source={{ uri: mediaUrl(product.imageUrl) }} style={styles.ownerInventoryImageMobile} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ownerInventoryNameMobile} numberOfLines={1}>{lang === 'bn' ? (product.nameBn || product.name) : product.name}</Text>
                  <Text style={styles.ownerInventoryMetaMobile}>৳{product.price} · {product.stock} {lang === 'bn' ? 'স্টক' : 'stock'} · {product.unit || ''}</Text>
                  <Text style={[styles.ownerInventoryAvailabilityMobile, { color: product.available !== false && Number(product.stock) > 0 ? '#34d399' : '#f87171' }]}>{product.available !== false && Number(product.stock) > 0 ? (lang === 'bn' ? '🟢 ক্রেতার জন্য প্রাপ্য' : '🟢 Available to customers') : (lang === 'bn' ? '🔴 বর্তমানে অনুপলব্ধ' : '🔴 Currently unavailable')}</Text>
                </View>
                <View style={styles.ownerInventoryActionsMobile}>
                  <TouchableOpacity style={styles.inventoryEditButtonMobile} onPress={() => openProductEditor(product)}><Text style={styles.inventoryEditButtonText}>✎ {lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.inventoryRestockMini} onPress={() => openRestock(product)}><Text style={styles.inventoryRestockMiniText}>{lang === 'bn' ? '+ স্টক' : '+ Stock'}</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {lowStockProducts.length > 0 && (
            <View style={styles.lowStockCardMobile}>
              <View style={styles.lowStockMobileHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lowStockMobileTitle}>⚠️ {lang === 'bn' ? 'স্টক প্রায় শেষ' : 'Low Stock'}</Text>
                  <Text style={styles.lowStockMobileSub}>{lang === 'bn' ? '৫টির কম থাকা পণ্য দ্রুত রিস্টক করুন' : 'Restock products with fewer than 5 left'}</Text>
                </View>
                <TouchableOpacity style={styles.reminderButtonMobile} onPress={showLowStockReminder}><Text style={styles.reminderButtonMobileText}>🔔 {lang === 'bn' ? 'রিমাইন্ডার' : 'Reminder'}</Text></TouchableOpacity>
              </View>
              {loadingOwnerProducts ? <ActivityIndicator color="#f59e0b" /> : lowStockProducts.map(product => (
                <View key={product._id} style={styles.lowStockProductRow}>
                  <Image source={{ uri: mediaUrl(product.imageUrl) }} style={styles.lowStockProductImage} />
                  <View style={styles.lowStockProductInfo}>
                    <Text style={styles.lowStockProductName}>{lang === 'bn' ? (product.nameBn || product.name) : product.name}</Text>
                    <Text style={styles.lowStockProductMeta}>{lang === 'bn' ? 'বাকি' : 'Left'}: {product.stock} · {product.unit || ''}</Text>
                  </View>
                  <TouchableOpacity style={styles.restockButtonMobile} onPress={() => openRestock(product)}><Text style={styles.restockButtonMobileText}>+ {lang === 'bn' ? 'রিস্টক' : 'Restock'}</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.ownerOrdersSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>{lang === 'bn' ? 'আগত অর্ডারসমূহ' : 'Live Incoming Orders'}</Text>
              <TouchableOpacity onPress={fetchOwnerOrders}>
                <Text style={styles.refreshLink}>🔄 {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {['ALL','NEW','PREPARING','COMPLETED'].map(key => (
                <TouchableOpacity key={key} style={[styles.ownerFilterChip, ownerFilter === key && styles.ownerFilterChipActive]} onPress={() => setOwnerFilter(key)}>
                  <Text style={[styles.ownerFilterText, ownerFilter === key && styles.ownerFilterTextActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {ownerRiderOffers.length > 0 && <View style={styles.riderOfferBox}>
              <Text style={styles.sectionHeading}>🛵 {lang === 'bn' ? 'রাইডার অফার' : 'Rider Offers'} ({ownerRiderOffers.length})</Text>
              {ownerRiderOffers.slice(0, 6).map(offer => <View key={offer._id} style={styles.riderOfferCard}>
                <Text style={styles.mobileOrderShop}>{offer.riderName} · {offer.vehicleType || 'Rider'}</Text>
                <Text style={styles.orderItemRow}>Order #{offer.order?.orderNumber || ''}</Text>
                <TouchableOpacity style={[styles.statusActionBtn, { backgroundColor: '#2563eb' }]} onPress={() => acceptRiderOffer(offer)}><Text style={styles.statusActionBtnText}>{lang === 'bn' ? 'রাইডার গ্রহণ' : 'Accept Rider'}</Text></TouchableOpacity>
              </View>)}
            </View>}

            {loadingOwnerOrders ? (
              <ActivityIndicator size="large" color="#10b981" />
            ) : ownerOrders.length === 0 ? (
              <Text style={styles.emptyText}>{lang === 'bn' ? 'কোনো অর্ডার নেই।' : 'No orders found.'}</Text>
            ) : (
              ownerOrders.filter(order => {
                if (ownerFilter === 'NEW') return order.status === 'PLACED';
                if (ownerFilter === 'PREPARING') return ['ACCEPTED','PREPARING','READY'].includes(order.status);
                if (ownerFilter === 'COMPLETED') return ['DELIVERED','COMPLETED'].includes(order.status);
                return true;
              }).map(order => (
                <View key={order._id} style={styles.ownerOrderCard}>
                  <View style={styles.orderCardHeader}>
                    <Text style={styles.orderIdText}>{order.orderNumber || order._id}</Text>
                    <Text style={[styles.orderStatusBadge, { color: '#10b981' }]}>{order.status}</Text>
                  </View>

                  <View style={styles.sharedProfileMiniRow}>{order.customerImageUrl ? <Image source={{ uri: mediaUrl(order.customerImageUrl) }} style={styles.sharedProfileMiniAvatar} /> : <Text style={styles.sharedProfileMiniFallback}>👤</Text>}<View style={{ flex: 1 }}><Text style={styles.sharedProfileMiniName}>{order.customerName || 'Customer'}</Text><Text style={styles.riderMeta}>{order.customerPhone || ''}</Text></View></View>
                  <Text style={styles.orderCustomerAddress}>📍 {order.deliveryAddress}</Text>

                  <View style={styles.orderItemsList}>
                    {order.items && order.items.map((item, idx) => (
                      <Text key={idx} style={styles.orderItemRow}>
                        • {item.productName} ({item.unit}) x {item.quantity} = ৳{item.price * item.quantity}
                      </Text>
                    ))}
                  </View>

                  <Text style={styles.orderTotalText}>Total: ৳{order.totalPrice}</Text>
                  {order.cancellationReason ? <View style={styles.cancelReasonBox}><Text style={styles.cancelReasonText}>⛔ {lang === 'bn' ? 'বাতিলের কারণ' : 'Cancellation reason'}: {order.cancellationReason}</Text></View> : null}
                  <View style={styles.communicationRow}><TouchableOpacity style={styles.communicationSecondary} onPress={() => openChat(order)}><Text style={styles.communicationSecondaryText}>💬 {lang === 'bn' ? 'চ্যাট' : 'Chat'}</Text></TouchableOpacity><TouchableOpacity style={styles.communicationSecondary} onPress={() => callOrderParty(order)}><Text style={styles.communicationSecondaryText}>📞 {lang === 'bn' ? 'কল' : 'Call'}</Text></TouchableOpacity></View>

                  {/* Status Actions */}
                  <View style={styles.statusBtnGroup}>
                    {order.status === 'PLACED' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#3b82f6' }]}
                        onPress={() => updateOrderStatus(order._id, 'ACCEPTED')}
                      >
                        <Text style={styles.statusActionBtnText}>{lang==='bn'?'অর্ডার গ্রহণ করুন':'Accept Order'}</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#8b5cf6' }]}
                        onPress={() => updateOrderStatus(order._id, 'PREPARING')}
                      >
                        <Text style={styles.statusActionBtnText}>{lang==='bn'?'প্রস্তুত করা শুরু করুন':'Start Preparing'}</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'PREPARING' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#f59e0b' }]}
                        onPress={() => updateOrderStatus(order._id, 'READY')}
                      >
                        <Text style={styles.statusActionBtnText}>{lang==='bn'?'প্রস্তুত হিসেবে চিহ্নিত করুন':'Mark Ready'}</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'READY' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#2563eb' }]}
                        onPress={() => updateOrderStatus(order._id, 'OUT_FOR_DELIVERY')}
                      >
                        <Text style={styles.statusActionBtnText}>{lang==='bn'?'ডেলিভারিতে পাঠান':'Dispatch Delivery'}</Text>
                      </TouchableOpacity>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <TouchableOpacity
                        style={[styles.statusActionBtn, { backgroundColor: '#10b981' }]}
                        onPress={() => updateOrderStatus(order._id, 'DELIVERED')}
                      >
                        <Text style={styles.statusActionBtnText}>{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Mark Delivered'}</Text>
                      </TouchableOpacity>
                    )}
                    {['PLACED','ACCEPTED','PREPARING','READY'].includes(order.status) && (
                      <TouchableOpacity style={styles.cancelOrderButton} onPress={() => openCancelOrder(order, 'owner')}>
                        <Text style={styles.cancelOrderButtonText}>✕ {lang === 'bn' ? 'কারণসহ বাতিল' : 'Cancel with reason'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        /* 4. Rider View */
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.ownerHeaderCard}>
            <View style={styles.ownerProfileRow}>
              {profileImage ? <Image source={{ uri: mediaUrl(profileImage) }} style={styles.ownerProfileImage} /> : <Text style={styles.ownerProfileIcon}>🛵</Text>}
              <View style={{ flex: 1 }}>
                <Text style={styles.ownerTitle}>{user?.name || 'Rider'}</Text>
                <Text style={styles.ownerSub}>{profileVehicleType || 'Bicycle'} · {user?.riderVerificationStatus || 'NOT_SUBMITTED'}</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileVisible(true)}><Text style={styles.refreshLink}>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.availabilityButton, riderAvailable ? styles.availabilityOn : styles.availabilityOff]} onPress={toggleRiderAvailability}>
              <Text style={styles.availabilityText}>{riderAvailable ? '🟢 Available for Delivery' : '🔴 Not Available'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ownerOrdersSection}>
            <View style={styles.sectionHeaderRow}><Text style={styles.sectionHeading}>{lang === 'bn' ? 'কাছাকাছি ডেলিভারি অর্ডার' : 'Nearby Delivery Orders'}</Text><TouchableOpacity onPress={fetchRiderOrders}><Text style={styles.refreshLink}>🔄</Text></TouchableOpacity></View>
            {riderLoading ? <ActivityIndicator size="large" color="#10b981" /> : !riderAvailable ? <Text style={styles.emptyText}>{lang==='bn'?'ডেলিভারি অনুরোধ পেতে নিজেকে উপলভ্য করুন।':'Set yourself Available to receive delivery requests.'}</Text> : riderNearbyOrders.length === 0 ? <Text style={styles.emptyText}>{lang === 'bn' ? 'এই মুহূর্তে কোনো নতুন ডেলিভারি নেই।' : 'No open deliveries right now.'}</Text> : riderNearbyOrders.map(order => (
              <View key={order._id} style={styles.ownerOrderCard}>
                <View style={styles.orderCardHeader}><Text style={styles.orderIdText}>{order.orderNumber}</Text><Text style={styles.orderStatusBadge}>{order.status}</Text></View>
                <Text style={styles.mobileOrderShop}>🏪 {order.shop?.shopNameBn || order.shop?.shopName || order.shopName}</Text>
                <Text style={styles.orderCustomerAddress}>📍 {order.shop?.address || order.deliveryAddress}</Text>
                <Text style={styles.orderItemRow}>{(order.items || []).map(i => `${i.productName} × ${i.quantity}`).join(', ')}</Text>
                <Text style={styles.orderTotalText}>৳{order.totalPrice}</Text>
                {order.myOffer ? <Text style={styles.offerSentText}>✅ {lang==='bn'?'প্রস্তাব পাঠানো হয়েছে · দোকানদারের অপেক্ষায়':'Offer sent · waiting for seller'}</Text> : <TouchableOpacity style={styles.statusActionBtn} onPress={() => offerDelivery(order._id)}><Text style={styles.statusActionBtnText}>{lang==='bn'?'আমি ডেলিভারি করতে প্রস্তুত':'I am available to deliver'}</Text></TouchableOpacity>}
              </View>
            ))}
          </View>

          <View style={styles.ownerOrdersSection}>
            <Text style={styles.sectionHeading}>{lang === 'bn' ? 'আমার ডেলিভারি' : 'My Deliveries'}</Text>
            {riderMineOrders.length === 0 ? <Text style={styles.emptyText}>{lang==='bn'?'এখনও কোনো ডেলিভারি নেওয়া হয়নি।':'No assigned deliveries yet.'}</Text> : riderMineOrders.map(order => (
              <View key={order._id} style={styles.ownerOrderCard}>
                <View style={styles.orderCardHeader}><Text style={styles.orderIdText}>{order.orderNumber}</Text><Text style={styles.orderStatusBadge}>{order.status}</Text></View>
                <Text style={styles.mobileOrderShop}>🏪 {order.shopName}</Text>
                <Text style={styles.orderCustomerAddress}>📍 {order.deliveryAddress}</Text>
                {order.pickupCode && !order.pickupVerifiedAt ? <>
                  <Text style={styles.riderMeta}>{lang === 'bn' ? 'দোকানদারও একই পিকআপ কোড দেখতে পাবেন।' : 'Seller also sees the same pickup code.'}</Text>
                  <TextInput style={styles.formInput} placeholder={lang === 'bn' ? '৬ সংখ্যার পিকআপ কোড' : 'Enter 6-digit pickup code'} placeholderTextColor="#94a3b8" keyboardType="number-pad" value={pickupCodeInputs[order._id] || ''} onChangeText={value => setPickupCodeInputs(prev => ({ ...prev, [order._id]: value }))} />
                  <TouchableOpacity style={[styles.statusActionBtn, { backgroundColor: '#2563eb' }]} onPress={() => verifyPickup(order._id)}><Text style={styles.statusActionBtnText}>{lang === 'bn' ? 'পিকআপ যাচাই' : 'Verify Pickup'}</Text></TouchableOpacity>
                </> : null}
                {order.status === 'OUT_FOR_DELIVERY' && <TouchableOpacity style={[styles.statusActionBtn, { backgroundColor: '#10b981' }]} onPress={() => markRiderDelivered(order._id)}><Text style={styles.statusActionBtnText}>{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Mark Delivered'}</Text></TouchableOpacity>}
                <View style={styles.communicationRow}><TouchableOpacity style={styles.communicationSecondary} onPress={() => openChat(order)}><Text style={styles.communicationSecondaryText}>💬 {lang === 'bn' ? 'চ্যাট' : 'Chat'}</Text></TouchableOpacity><TouchableOpacity style={styles.communicationSecondary} onPress={() => callOrderParty(order)}><Text style={styles.communicationSecondaryText}>📞 {lang === 'bn' ? 'কল' : 'Call'}</Text></TouchableOpacity></View>
              </View>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <Modal visible={cancelVisible} animationType="fade" transparent onRequestClose={() => setCancelVisible(false)}>
        <View style={styles.restockModalOverlay}>
          <View style={styles.cancelModalCard}>
            <Text style={styles.restockModalTitle}>{lang === 'bn' ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}</Text>
            <Text style={styles.cancelModalSub}>{lang === 'bn' ? 'একটি কারণ নির্বাচন করুন। এই কারণটি অন্য পক্ষ দেখতে পাবে।' : 'Choose a reason. The other party will be able to see it.'}</Text>
            <Text style={styles.cancelSuggestionLabel}>{lang === 'bn' ? 'প্রস্তাবিত কারণ' : 'Suggested reasons'}</Text>
            {getCancelReasonOptions(cancelOrderTarget?.cancelActor).map(reason => <TouchableOpacity key={reason} style={[styles.cancelReasonChoice, cancelReason === reason && styles.cancelReasonChoiceActive]} onPress={() => setCancelReason(reason)}><Text style={[styles.cancelReasonChoiceText, cancelReason === reason && styles.cancelReasonChoiceTextActive]}>{reason}</Text></TouchableOpacity>)}
            <TextInput style={[styles.formInput, { marginTop: 10 }]} value={cancelReasonCustom} onChangeText={setCancelReasonCustom} placeholder={['Other','অন্যান্য'].includes(cancelReason) ? (lang === 'bn' ? 'কারণ লিখুন' : 'Write the reason') : (lang === 'bn' ? 'অতিরিক্ত তথ্য (ঐচ্ছিক)' : 'Optional details')} placeholderTextColor="#94a3b8" multiline maxLength={160} />
            <View style={styles.restockModalActions}>
              <TouchableOpacity style={styles.restockCancelBtn} onPress={() => setCancelVisible(false)}><Text style={styles.restockCancelText}>{lang === 'bn' ? 'ফিরে যান' : 'Keep Order'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelConfirmBtn} onPress={submitOrderCancellation}><Text style={styles.cancelConfirmText}>{lang === 'bn' ? 'অর্ডার বাতিল' : 'Cancel Order'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addProductVisible} animationType="slide" transparent={false} onRequestClose={() => setAddProductVisible(false)}>
        <SafeAreaView style={styles.modalSafe}><View style={styles.cartModalContainer}>
          <View style={styles.modalHeader}><TouchableOpacity onPress={() => setAddProductVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'ফিরুন' : 'Back'}</Text></TouchableOpacity><Text style={styles.modalHeaderTitle}>{lang === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add New Product'}</Text><View style={{width:40}} /></View>
          <ScrollView style={styles.cartScroll} contentContainerStyle={{padding:18,paddingBottom:48}} keyboardShouldPersistTaps="handled">
            <View style={styles.productAddHero}><Text style={styles.productAddHeroIcon}>＋</Text><View style={{flex:1}}><Text style={styles.productAddHeroTitle}>{lang==='bn'?'ইনভেন্টরিতে নতুন পণ্য':'New inventory product'}</Text><Text style={styles.productAddHeroSub}>{lang==='bn'?'ছবি, ক্যাটাগরি, দাম, স্টক ও প্রাপ্যতা একসাথে সেট করুন।':'Set photo, category, price, stock and availability in one place.'}</Text></View></View>
            <View style={styles.productFormSectionHeader}><Text style={styles.productFormSectionNumber}>01</Text><View><Text style={styles.productFormSectionTitle}>{lang==='bn'?'পণ্যের পরিচিতি':'Product identity'}</Text><Text style={styles.productFormSectionSub}>{lang==='bn'?'ছবি, নাম ও ক্যাটাগরি':'Photo, names and category'}</Text></View></View>
            <TouchableOpacity style={styles.productEditPhotoBox} onPress={chooseNewProductPhoto}><Image source={{uri:mediaUrl(newProduct.imageUrl)}} style={styles.productEditPhoto}/><Text style={styles.productEditPhotoText}>📷 {lang === 'bn' ? 'পণ্যের ছবি নির্বাচন করুন' : 'Choose product photo'}</Text></TouchableOpacity>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'পণ্যের নাম (ইংরেজি)' : 'Product Name (English)'}</Text><TextInput style={styles.formInput} value={newProduct.name} onChangeText={v=>setNewProduct(p=>({...p,name:v}))} placeholder={lang==='bn'?'যেমন: Soybean Oil':'e.g. Soybean Oil'} placeholderTextColor="#94a3b8"/>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'পণ্যের নাম (বাংলা)' : 'Product Name (Bangla)'}</Text><TextInput style={styles.formInput} value={newProduct.nameBn} onChangeText={v=>setNewProduct(p=>({...p,nameBn:v}))} placeholder={lang==='bn'?'যেমন: সয়াবিন তেল':'e.g. সয়াবিন তেল'} placeholderTextColor="#94a3b8"/>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</Text>
            <View style={styles.productCategoryWrap}>{PRODUCT_CATEGORIES.map(cat => <TouchableOpacity key={cat.value} style={[styles.productCategoryChoice,newProduct.category===cat.value&&styles.productCategoryChoiceActive]} onPress={()=>setNewProduct(p=>({...p,category:cat.value}))}><Text style={[styles.productCategoryChoiceText,newProduct.category===cat.value&&styles.productCategoryChoiceTextActive]}>{lang==='bn'?cat.bn:cat.en}</Text></TouchableOpacity>)}</View>
            {newProduct.category === 'Others' && <><Text style={styles.formLabel}>{lang === 'bn' ? 'নিজের ক্যাটাগরির নাম' : 'Custom Category Name'}</Text><TextInput style={styles.formInput} value={newProduct.customCategory} onChangeText={v=>setNewProduct(p=>({...p,customCategory:v}))} placeholder={lang==='bn'?'যেমন: স্থানীয় হস্তশিল্প':'e.g. Local Handmade'} placeholderTextColor="#94a3b8" maxLength={60}/></>}
            <View style={styles.productFormSectionHeader}><Text style={styles.productFormSectionNumber}>02</Text><View><Text style={styles.productFormSectionTitle}>{lang==='bn'?'বিস্তারিত তথ্য':'Product details'}</Text><Text style={styles.productFormSectionSub}>{lang==='bn'?'ব্র্যান্ড, বিবরণ ও ইউনিট':'Brand, description and unit'}</Text></View></View>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'ব্র্যান্ড (ঐচ্ছিক)' : 'Brand (optional)'}</Text><TextInput style={styles.formInput} value={newProduct.brand} onChangeText={v=>setNewProduct(p=>({...p,brand:v}))} placeholder={lang==='bn'?'যেমন: প্রাণ, রাঁধুনী, ফ্রেশ':'e.g. PRAN, Radhuni, Fresh'} placeholderTextColor="#94a3b8" maxLength={80}/>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'পণ্যের বিবরণ (ঐচ্ছিক)' : 'Product details (optional)'}</Text><TextInput style={[styles.formInput,{minHeight:72,textAlignVertical:'top'}]} value={newProduct.description} onChangeText={v=>setNewProduct(p=>({...p,description:v}))} placeholder={lang==='bn'?'ছোট বিবরণ, সাইজ বা ভ্যারিয়েন্ট':'Short note, size or variant'} placeholderTextColor="#94a3b8" maxLength={180} multiline/>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'ইউনিট / ওজন' : 'Unit / Weight'}</Text><TextInput style={styles.formInput} value={newProduct.unit} onChangeText={v=>setNewProduct(p=>({...p,unit:v}))} placeholder={lang==='bn'?'১ কেজি / ১ লিটার / ১২টি':'1 kg / 1 L / 12 pcs'} placeholderTextColor="#94a3b8"/>
            <View style={styles.productFormSectionHeader}><Text style={styles.productFormSectionNumber}>03</Text><View><Text style={styles.productFormSectionTitle}>{lang==='bn'?'দাম, স্টক ও প্রাপ্যতা':'Price, stock & availability'}</Text><Text style={styles.productFormSectionSub}>{lang==='bn'?'অর্ডারের আগে সব তথ্য যাচাই করুন':'Review before adding to inventory'}</Text></View></View>
            <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Text style={styles.formLabel}>{lang==='bn'?'দাম (৳)':'Price (৳)'}</Text><TextInput style={styles.formInput} keyboardType="decimal-pad" value={newProduct.price} onChangeText={v=>setNewProduct(p=>({...p,price:v}))}/></View><View style={{flex:1}}><Text style={styles.formLabel}>{lang==='bn'?'প্রাথমিক স্টক':'Initial Stock'}</Text><TextInput style={styles.formInput} keyboardType="number-pad" value={newProduct.stock} onChangeText={v=>setNewProduct(p=>({...p,stock:v}))}/></View></View>
            <TouchableOpacity style={[styles.productAvailabilityToggleMobile,newProduct.available?styles.productAvailabilityOnMobile:styles.productAvailabilityOffMobile]} onPress={()=>setNewProduct(p=>({...p,available:!p.available}))}><Text style={styles.productAvailabilityTextMobile}>{newProduct.available?(lang==='bn'?'🟢 ক্রেতার জন্য প্রাপ্য':'🟢 Available to customers'):(lang==='bn'?'🔴 বর্তমানে অনুপলব্ধ':'🔴 Currently unavailable')}</Text><Text style={styles.productAvailabilityHelpMobile}>{lang==='bn'?'ট্যাপ করে পরিবর্তন করুন':'Tap to change'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.checkoutBtn,savingNewProduct&&{opacity:.6}]} disabled={savingNewProduct} onPress={submitNewProduct}><Text style={styles.checkoutBtnText}>{savingNewProduct?(lang==='bn'?'সেভ হচ্ছে…':'Saving…'):(lang==='bn'?'পণ্য যোগ করুন':'Add Product')}</Text></TouchableOpacity>
          </ScrollView>
        </View></SafeAreaView>
      </Modal>

      <Modal visible={editProductVisible} animationType="slide" transparent={false} onRequestClose={() => setEditProductVisible(false)}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.cartModalContainer}>
            <View style={styles.modalHeader}><TouchableOpacity onPress={() => setEditProductVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'ফিরুন' : 'Back'}</Text></TouchableOpacity><Text style={styles.modalHeaderTitle}>{lang === 'bn' ? 'পণ্য কাস্টমাইজ করুন' : 'Customize Product'}</Text><View style={{ width: 40 }} /></View>
            {editProduct && <ScrollView style={styles.cartScroll} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              <TouchableOpacity style={styles.productEditPhotoBox} onPress={chooseProductEditPhoto}>
                <Image source={{ uri: mediaUrl(editProduct.imageUrl) }} style={styles.productEditPhoto} />
                <Text style={styles.productEditPhotoText}>📷 {lang === 'bn' ? 'পণ্যের ছবি পরিবর্তন' : 'Change product photo'}</Text>
              </TouchableOpacity>
              <Text style={styles.formLabel}>{lang === 'bn' ? 'পণ্যের নাম' : 'Product Name'}</Text><TextInput style={styles.formInput} value={editProduct.name} onChangeText={value => setEditProduct(previous => ({ ...previous, name: value }))} />
              <Text style={styles.formLabel}>{lang === 'bn' ? 'বাংলা নাম' : 'Bangla Name'}</Text><TextInput style={styles.formInput} value={editProduct.nameBn} onChangeText={value => setEditProduct(previous => ({ ...previous, nameBn: value }))} />
              <Text style={styles.formLabel}>{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</Text><View style={styles.productCategoryWrap}>{PRODUCT_CATEGORIES.map(cat => <TouchableOpacity key={`edit-${cat.value}`} style={[styles.productCategoryChoice,editProduct.category===cat.value&&styles.productCategoryChoiceActive]} onPress={()=>setEditProduct(previous=>({...previous,category:cat.value}))}><Text style={[styles.productCategoryChoiceText,editProduct.category===cat.value&&styles.productCategoryChoiceTextActive]}>{lang==='bn'?cat.bn:cat.en}</Text></TouchableOpacity>)}</View>{editProduct.category==='Others'&&<TextInput style={styles.formInput} value={editProduct.customCategory || ''} onChangeText={value=>setEditProduct(previous=>({...previous,customCategory:value}))} placeholder={lang==='bn'?'নিজের ক্যাটাগরির নাম লিখুন':'Enter your custom category'} placeholderTextColor="#94a3b8" maxLength={60}/>}
              <Text style={styles.formLabel}>{lang === 'bn' ? 'ব্র্যান্ড (ঐচ্ছিক)' : 'Brand (optional)'}</Text><TextInput style={styles.formInput} value={editProduct.brand || ''} onChangeText={value => setEditProduct(previous => ({ ...previous, brand: value }))} maxLength={80} />
              <Text style={styles.formLabel}>{lang === 'bn' ? 'পণ্যের বিবরণ (ঐচ্ছিক)' : 'Product details (optional)'}</Text><TextInput style={[styles.formInput,{minHeight:72,textAlignVertical:'top'}]} value={editProduct.description || ''} onChangeText={value => setEditProduct(previous => ({ ...previous, description: value }))} maxLength={180} multiline />
              <Text style={styles.formLabel}>{lang === 'bn' ? 'ইউনিট / ওজন' : 'Unit / Weight'}</Text><TextInput style={styles.formInput} value={editProduct.unit} onChangeText={value => setEditProduct(previous => ({ ...previous, unit: value }))} />
              <Text style={styles.formLabel}>{lang === 'bn' ? 'দাম' : 'Price'} (৳)</Text><TextInput style={styles.formInput} keyboardType="decimal-pad" value={String(editProduct.price)} onChangeText={value => setEditProduct(previous => ({ ...previous, price: value }))} />
              <Text style={styles.formLabel}>{lang === 'bn' ? 'স্টক' : 'Stock'}</Text><TextInput style={styles.formInput} keyboardType="number-pad" value={String(editProduct.stock)} onChangeText={value => setEditProduct(previous => ({ ...previous, stock: value }))} />
              <TouchableOpacity style={[styles.productAvailabilityToggleMobile, editProduct.available ? styles.productAvailabilityOnMobile : styles.productAvailabilityOffMobile]} onPress={() => setEditProduct(previous => ({ ...previous, available: !previous.available }))}>
                <Text style={styles.productAvailabilityTextMobile}>{editProduct.available ? (lang === 'bn' ? '🟢 ক্রেতার জন্য প্রাপ্য' : '🟢 Available to customers') : (lang === 'bn' ? '🔴 বর্তমানে অনুপলব্ধ' : '🔴 Currently unavailable')}</Text>
                <Text style={styles.productAvailabilityHelpMobile}>{lang === 'bn' ? 'ট্যাপ করে পরিবর্তন করুন' : 'Tap to change'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.checkoutBtn, savingProductEdit && { opacity: 0.6 }]} disabled={savingProductEdit} onPress={saveProductEdit}><Text style={styles.checkoutBtnText}>{savingProductEdit ? (lang === 'bn' ? 'সেভ হচ্ছে…' : 'Saving…') : (lang === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Changes')}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.deleteProductButtonMobile} onPress={deleteProductMobile}><Text style={styles.deleteProductButtonText}>🗑 {lang === 'bn' ? 'ইনভেন্টরি থেকে মুছুন' : 'Delete from Inventory'}</Text></TouchableOpacity>
            </ScrollView>}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={restockVisible} animationType="fade" transparent>
        <View style={styles.restockModalOverlay}>
          <View style={styles.restockModalCard}>
            <Text style={styles.restockModalTitle}>{lang === 'bn' ? 'পণ্য রিস্টক করুন' : 'Restock Product'}</Text>
            <Text style={styles.restockModalProduct}>{restockTarget ? (lang === 'bn' ? (restockTarget.nameBn || restockTarget.name) : restockTarget.name) : ''}</Text>
            <Text style={styles.restockModalMeta}>{lang === 'bn' ? 'বর্তমান স্টক' : 'Current stock'}: {restockTarget?.stock ?? 0}</Text>
            <Text style={styles.formLabel}>{lang === 'bn' ? 'কতটি যোগ করবেন?' : 'Quantity to add'}</Text>
            <TextInput style={styles.formInput} keyboardType="number-pad" value={restockAmount} onChangeText={setRestockAmount} placeholder="10" placeholderTextColor="#94a3b8" />
            <View style={styles.restockModalActions}>
              <TouchableOpacity style={styles.restockCancelBtn} onPress={() => setRestockVisible(false)}><Text style={styles.restockCancelText}>{lang === 'bn' ? 'বাতিল' : 'Cancel'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.restockConfirmBtn} onPress={submitRestock}><Text style={styles.restockConfirmText}>{lang === 'bn' ? 'স্টক যোগ করুন' : 'Add Stock'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={profileVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.cartModalContainer}>
            <View style={styles.modalHeader}><TouchableOpacity onPress={() => setProfileVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'ফিরুন' : 'Back'}</Text></TouchableOpacity><Text style={styles.modalHeaderTitle}>{lang === 'bn' ? (role === 'owner' ? 'দোকানদারের প্রোফাইল' : role === 'rider' ? 'রাইডারের প্রোফাইল' : 'ক্রেতার প্রোফাইল') : (role === 'owner' ? 'Seller Profile' : role === 'rider' ? 'Rider Profile' : 'Customer Profile')}</Text><View style={{ width: 40 }} /></View>
            <ScrollView style={styles.cartScroll}>
              <TouchableOpacity style={styles.profilePhotoButton} onPress={chooseProfilePhoto}>
                {profileImage ? <Image source={{ uri: mediaUrl(profileImage) }} style={styles.profilePhoto} /> : <Text style={styles.authPhotoText}>📷 {lang === 'bn' ? 'প্রোফাইল ছবি যোগ করুন' : 'Add profile image'}</Text>}
              </TouchableOpacity>
              <Text style={styles.formLabel}>{lang==='bn'?'নাম':'Name'}</Text><TextInput style={styles.formInput} value={profileName} onChangeText={setProfileName} />
              <Text style={styles.formLabel}>{lang==='bn'?'ফোন নম্বর':'Phone'}</Text><TextInput style={styles.formInput} value={profilePhone} onChangeText={setProfilePhone} keyboardType="phone-pad" />
              <Text style={styles.formLabel}>{lang==='bn'?'ঠিকানা':'Address'}</Text><TextInput style={styles.formInput} value={profileAddress} onChangeText={setProfileAddress} />
              {role === 'rider' && <><Text style={styles.formLabel}>{lang==='bn'?'স্থায়ী ঠিকানা':'Permanent Address'}</Text><TextInput style={styles.formInput} value={profilePermanentAddress} onChangeText={setProfilePermanentAddress} /><Text style={styles.formLabel}>{lang==='bn'?'যানের ধরন':'Vehicle Type'}</Text><TextInput style={styles.formInput} value={profileVehicleType} onChangeText={setProfileVehicleType} /></>}
              <TouchableOpacity style={styles.checkoutBtn} onPress={saveProfile}><Text style={styles.checkoutBtnText}>{lang==='bn'?'প্রোফাইল সেভ করুন':'Save Profile'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.closeAccountButton} onPress={onLogout}><Text style={styles.refreshLink}>{lang==='bn'?'লগ আউট':'Log out'}</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Notification Center */}
      <Modal visible={notificationsVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.cartModalContainer}>
            <View style={styles.modalHeader}><TouchableOpacity onPress={() => setNotificationsVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'ফিরুন' : 'Back'}</Text></TouchableOpacity><Text style={styles.modalHeaderTitle}>🔔 {lang==='bn'?'নোটিফিকেশন':'Notifications'}</Text><TouchableOpacity onPress={fetchNotifications}><Text style={styles.refreshLink}>🔄</Text></TouchableOpacity></View>
            <ScrollView style={styles.cartScroll}>
              {notifications.length === 0 ? <Text style={styles.emptyText}>{lang==='bn'?'এখনও কোনো নোটিফিকেশন নেই।':'No notifications yet.'}</Text> : notifications.map(n => <View key={n._id} style={[styles.notificationCard, !n.read && styles.notificationUnread]}><Text style={styles.notificationTitle}>{n.title}</Text><Text style={styles.notificationBody}>{n.message}</Text><Text style={styles.notificationTime}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</Text></View>)}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 4. Shop Catalog Modal */}
      <Modal visible={!!selectedShop} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafe}>
          {selectedShop && (
            <View style={styles.shopModalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedShop(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}</Text>
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                  {lang === 'bn' ? selectedShop.shopNameBn : selectedShop.shopName}
                </Text>
                <TouchableOpacity onPress={() => setCartVisible(true)} style={styles.modalCartBtn}>
                  <Text style={styles.cartIconText}>🛍️</Text>
                  {totalCartCount > 0 && (
                    <View style={styles.modalBadge}>
                      <Text style={styles.badgeText}>{totalCartCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Shop Banner */}
              <View style={styles.shopBanner}>
                <Image source={{ uri: mediaUrl(selectedShop.ownerImageUrl || selectedShop.imageUrl) }} style={styles.bannerImg} />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerShopName}>{lang === 'bn' ? selectedShop.shopNameBn : selectedShop.shopName}</Text>
                  <Text style={styles.bannerDistance}>⚡ {selectedShop.distanceMeters} {t.metersAway} • 🕒 {selectedShop.openingTime} - {selectedShop.closingTime}</Text>
                </View>
              </View>

              {/* Category Filter Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {shopCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catTab, selectedCategory === cat.id && styles.catTabActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catTabText, selectedCategory === cat.id && styles.catTabTextActive]}>
                      {lang === 'bn' ? cat.nameBn : cat.nameEn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Product List */}
              <ScrollView
                style={styles.prodScroll}
                contentContainerStyle={{ paddingBottom: totalCartCount > 0 ? 140 : 50 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {loadingProducts ? (
                  <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 30 }} />
                ) : filteredShopProducts.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {lang === 'bn' ? 'এই ক্যাটাগরিতে পণ্য পাওয়া যায়নি।' : 'No products found in this category.'}
                  </Text>
                ) : (
                  filteredShopProducts.map(prod => {
                    const cartItem = cart.find(c => c._id === prod._id);
                    return (
                      <View key={prod._id} style={styles.prodCard}>
                        <Image source={{ uri: mediaUrl(prod.imageUrl) }} style={styles.prodImg} />
                        <View style={styles.prodInfo}>
                          <Text style={styles.prodName}>{lang === 'bn' ? (prod.nameBn || prod.name) : prod.name}</Text>
                          {!!prod.brand && <Text style={[styles.prodUnit,{color:'#6ee7b7',fontWeight:'800'}]}>{prod.brand}</Text>}
                          <Text style={styles.prodUnit}>{prod.unit}</Text>
                          {!!prod.description && <Text style={[styles.prodUnit,{marginTop:2}]} numberOfLines={2}>{prod.description}</Text>}
                          <Text style={styles.prodPrice}>৳{prod.price}</Text>
                          <Text style={[styles.prodStock, { color: prod.stock > 0 ? '#10b981' : '#ef4444' }]}>
                            {prod.stock > 0 ? `${t.stock}: ${prod.stock}` : t.outOfStock}
                          </Text>
                        </View>

                        {/* Cart Stepper */}
                        {cartItem ? (
                          <View style={styles.qtyStepper}>
                            <TouchableOpacity onPress={() => updateQuantity(prod._id, -1)} style={styles.qtyBtn}>
                              <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyVal}>{cartItem.quantity}</Text>
                            <TouchableOpacity onPress={() => updateQuantity(prod._id, 1)} style={styles.qtyBtn}>
                              <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[styles.addCartBtn, prod.stock <= 0 && { backgroundColor: '#64748b' }]}
                            disabled={prod.stock <= 0}
                            onPress={() => addToCart(prod, selectedShop)}
                          >
                            <Text style={styles.addCartBtnText}>+ {lang === 'bn' ? 'যোগ করুন' : 'Add'}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {/* Bottom Sticky View Cart Button */}
              {totalCartCount > 0 && (
                <View style={styles.stickyCartBar}>
                  <View>
                    <Text style={styles.stickyCartCount}>{totalCartCount} {lang === 'bn' ? 'আইটেম' : 'Items'}</Text>
                    <Text style={styles.stickyCartTotal}>৳{cartTotal.total}</Text>
                  </View>
                  <TouchableOpacity style={styles.stickyCartBtn} onPress={() => setCartVisible(true)}>
                    <Text style={styles.stickyCartBtnText}>{lang === 'bn' ? 'কার্ট দেখুন ➔' : 'View Cart ➔'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* 5. Cart & Checkout Modal */}
      <Modal visible={cartVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.cartModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCartVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'ফিরে যান' : 'Back'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>{t.cartTitle}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.cartScroll}
              contentContainerStyle={styles.cartScrollContent}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {cart.length === 0 ? (
                <View style={styles.emptyCartBox}>
                  <Text style={styles.emptyIcon}>🛍️</Text>
                  <Text style={styles.emptyText}>{lang === 'bn' ? 'আপনার কার্ট খালি আছে' : 'Your cart is empty'}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.cartShopHeader}>🏪 {cartGroups.length} {lang === 'bn' ? 'টি দোকান' : 'shops in this checkout'}</Text>

                  {/* Cart Items grouped by shop */}
                  {cartGroups.map(group => (
                    <View key={group.shopId} style={styles.cartGroupBox}>
                      <Text style={styles.cartGroupTitle}>🏪 {lang === 'bn' ? (group.shopNameBn || group.shopName) : group.shopName}</Text>
                      {group.items.map(item => (
                        <View key={item._id} style={styles.cartItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.cartItemName}>{lang === 'bn' ? (item.nameBn || item.name) : item.name}</Text>
                            <Text style={styles.cartItemSub}>৳{item.price} / {item.unit}</Text>
                          </View>
                          <View style={styles.qtyStepper}>
                            <TouchableOpacity onPress={() => updateQuantity(item._id, -1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
                            <Text style={styles.qtyVal}>{item.quantity}</Text>
                            <TouchableOpacity onPress={() => updateQuantity(item._id, 1)} style={styles.qtyBtn}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
                          </View>
                          <Text style={styles.cartItemTotal}>৳{item.price * item.quantity}</Text>
                        </View>
                      ))}
                      {orderType === 'DELIVERY' && <Text style={styles.cartGroupFee}>Delivery fee: ৳{group.deliveryFee || 20}</Text>}
                    </View>
                  ))}

                  {/* Order Type Selector */}
                  <View style={styles.orderTypeContainer}>
                    <Text style={styles.formLabel}>{lang === 'bn' ? 'অর্ডার ধরন' : 'Order Type'}</Text>
                    <View style={styles.orderTypeRow}>
                      <TouchableOpacity
                        style={[styles.typeBtn, orderType === 'DELIVERY' && styles.typeBtnActive]}
                        onPress={() => setOrderType('DELIVERY')}
                      >
                        <Text style={[styles.typeBtnText, orderType === 'DELIVERY' && styles.typeBtnTextActive]}>
                          🛵 {lang === 'bn' ? 'হোম ডেলিভারি (৳২০)' : 'Delivery (৳20)'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.typeBtn, orderType === 'PICKUP' && styles.typeBtnActive]}
                        onPress={() => setOrderType('PICKUP')}
                      >
                        <Text style={[styles.typeBtnText, orderType === 'PICKUP' && styles.typeBtnTextActive]}>
                          🚶 {lang === 'bn' ? 'দোকান থেকে পিকআপ' : 'Pickup (Free)'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Delivery Inputs */}
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>{t.addressLabel}</Text>
                    <TextInput
                      style={styles.formInput}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter Delivery Address"
                      placeholderTextColor="#94a3b8"
                    />

                    <Text style={styles.formLabel}>{t.phoneLabel}</Text>
                    <TextInput
                      style={styles.formInput}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="01XXXXXXXXX"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  {/* Bill Summary */}
                  <View style={styles.billBox}>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>{t.subtotal}</Text>
                      <Text style={styles.billVal}>৳{cartTotal.subtotal}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>{t.fee}</Text>
                      <Text style={styles.billVal}>৳{cartTotal.deliveryFee}</Text>
                    </View>
                    <View style={[styles.billRow, styles.billRowTotal]}>
                      <Text style={styles.billTotalLabel}>{t.total}</Text>
                      <Text style={styles.billTotalVal}>৳{cartTotal.total}</Text>
                    </View>
                  </View>

                  {/* Payment Methods */}
                  <View style={styles.paymentBox}>
                    <Text style={styles.paymentMethodTitle}>💳 {lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</Text>
                    <View style={styles.paymentMethodRow}>
                      {[['CASH_ON_DELIVERY','💵 Cash'],['BKASH','🟣 bKash'],['NAGAD','🟠 Nagad'],['UPAY','🟢 Upay']].map(([key,label]) => (
                        <TouchableOpacity key={key} style={[styles.paymentChoice, paymentMethod === key && styles.paymentChoiceActive]} onPress={() => setPaymentMethod(key)}>
                          <Text style={[styles.paymentChoiceText, paymentMethod === key && styles.paymentChoiceTextActive]}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.paymentDemoNote}>{lang === 'bn' ? 'মোবাইল পেমেন্ট এখন ডেমো মোডে। লাইভ করতে মার্চেন্ট ক্রেডেনশিয়াল লাগবে।' : 'Mobile payment runs in demo mode until merchant credentials are added.'}</Text>
                    {paymentMethod !== 'CASH_ON_DELIVERY' && (
                      <View style={styles.walletSenderBox}>
                        <Text style={styles.formLabel}>{lang === 'bn' ? 'যে নম্বর থেকে পেমেন্ট করবেন' : 'Wallet sender number'}</Text>
                        <TextInput
                          style={styles.formInput}
                          keyboardType="phone-pad"
                          placeholder="01712345678"
                          placeholderTextColor="#64748b"
                          value={paymentSenderPhone}
                          onChangeText={setPaymentSenderPhone}
                          maxLength={18}
                        />
                        <Text style={styles.paymentDemoNote}>{lang === 'bn' ? 'দোকানদার শুধু শেষ ৩ ডিজিট দেখবেন; পুরো নম্বর সংরক্ষণ হবে না।' : 'Seller sees only the last 3 digits; the full number is not stored.'}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cartEndSpacer}>
                    <Text style={styles.cartEndHint}>{lang === 'bn' ? 'নিচের সবুজ বাটন থেকে অর্ডার নিশ্চিত করুন।' : 'Use the green button below to confirm your order.'}</Text>
                  </View>
                </>
              )}
            </ScrollView>
            {cart.length > 0 && (
              <View style={styles.stickyCheckoutBar}>
                <View>
                  <Text style={styles.stickyCheckoutLabel}>{lang === 'bn' ? 'মোট' : 'Total'}</Text>
                  <Text style={styles.stickyCheckoutTotal}>৳{cartTotal.total}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.stickyCheckoutButton, submittingOrder && { opacity: 0.7 }]}
                  disabled={submittingOrder}
                  onPress={handlePlaceOrder}
                >
                  {submittingOrder ? <ActivityIndicator color="#fff" /> : <Text style={styles.stickyCheckoutButtonText}>✓ {t.checkout}</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Order Chat Modal */}
      <Modal visible={chatVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.trackingContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'বন্ধ' : 'Close'}</Text></TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>💬 {lang === 'bn' ? 'অর্ডার চ্যাট' : 'Order Chat'}</Text>
              <TouchableOpacity onPress={() => loadChat(activeOrder)}><Text style={styles.refreshLink}>🔄</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.mobileChatMessages} contentContainerStyle={{ padding: 14 }}>
              {chatMessages.length === 0 ? <Text style={styles.emptyText}>{lang === 'bn' ? 'এখনও কোনো মেসেজ নেই।' : 'No messages yet.'}</Text> : chatMessages.map(m => {
                const mine = String(m.senderId) === String(user?._id);
                return <View key={m._id} style={[styles.mobileChatBubble, mine && styles.mobileChatBubbleMine]}><Text style={[styles.mobileChatMeta, mine && {color:'#d1fae5'}]}>{m.senderName} · {lang === 'bn' ? (m.senderRole === 'SHOP_OWNER' ? 'দোকানদার' : m.senderRole === 'RIDER' ? 'রাইডার' : 'ক্রেতা') : (m.senderRole === 'SHOP_OWNER' ? 'Seller' : m.senderRole === 'RIDER' ? 'Rider' : 'Customer')}</Text><Text style={[styles.mobileChatText, mine && {color:'#fff'}]}>{m.text}</Text></View>;
              })}
            </ScrollView>
            <View style={styles.mobileChatComposer}><TextInput style={styles.mobileChatInput} value={chatText} onChangeText={setChatText} placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Write a message...'} placeholderTextColor="#94a3b8" /><TouchableOpacity style={styles.authPrimaryButton} onPress={sendChat}><Text style={styles.authPrimaryText}>{lang === 'bn' ? 'পাঠান' : 'Send'}</Text></TouchableOpacity></View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 6. Live Order Tracking Modal */}
      <Modal visible={trackingVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.trackingContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setTrackingVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>{t.trackOrder}</Text>
              <TouchableOpacity onPress={refreshActiveOrder}>
                <Text style={styles.refreshLink}>🔄</Text>
              </TouchableOpacity>
            </View>

            {activeOrder && (
              <ScrollView style={styles.trackingScroll}>
                <View style={styles.orderSummaryCard}>
                  <Text style={styles.trackingOrderNumber}>Order #{activeOrder.orderNumber || activeOrder._id}</Text>
                  <Text style={styles.trackingShopName}>🏪 {activeOrder.shopName}</Text>
                  <Text style={styles.trackingTotal}>৳{activeOrder.totalPrice}</Text>
                </View>

                {/* Stepper Timeline */}
                <View style={styles.timelineBox}>
                  {[
                    { key: 'PLACED', titleBn: 'অর্ডার গৃহীত হয়েছে', titleEn: 'Order Placed', icon: '📝' },
                    { key: 'ACCEPTED', titleBn: 'দোকানদার স্বীকার করেছেন', titleEn: 'Accepted by Shop', icon: '✅' },
                    { key: 'PREPARING', titleBn: 'প্যাকেট প্রস্তুত হচ্ছে', titleEn: 'Packing Items', icon: '📦' },
                    { key: 'READY', titleBn: 'ডেলিভারির জন্য প্রস্তুত', titleEn: 'Ready for Delivery', icon: '🛍️' },
                    { key: 'OUT_FOR_DELIVERY', titleBn: 'ডেলিভারিতে বের হয়েছে', titleEn: 'Out for Delivery', icon: '🛵' },
                    { key: 'DELIVERED', titleBn: 'ডেলিভারি সম্পন্ন', titleEn: 'Delivered', icon: '🎉' }
                  ].map((step, idx) => {
                    const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                    const currentIdx = statuses.indexOf(activeOrder.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <View key={step.key} style={styles.timelineStep}>
                        <View style={styles.timelineLeft}>
                          <View style={[
                            styles.stepCircle,
                            isDone && styles.stepCircleDone,
                            isCurrent && styles.stepCircleCurrent
                          ]}>
                            <Text style={styles.stepCircleText}>{step.icon}</Text>
                          </View>
                          {idx < 5 && <View style={[styles.stepLine, isDone && idx < currentIdx && styles.stepLineDone]} />}
                        </View>
                        <View style={styles.timelineRight}>
                          <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                            {lang === 'bn' ? step.titleBn : step.titleEn}
                          </Text>
                          {isCurrent && (
                            <Text style={styles.currentStepBadge}>
                              ⚡ {lang === 'bn' ? 'বর্তমান অবস্থা' : 'Current Status'}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Items Summary */}
                <View style={styles.trackingItemsBox}>
                  <Text style={styles.sectionHeading}>{lang === 'bn' ? 'অর্ডারকৃত পণ্য' : 'Ordered Items'}</Text>
                  {activeOrder.items && activeOrder.items.map((item, idx) => (
                    <Text key={idx} style={styles.trackingItemText}>
                      • {item.productName || item.name} ({item.unit}) x {item.quantity} = ৳{item.price * item.quantity}
                    </Text>
                  ))}
                </View>

                <View style={styles.trackingCommunication}>
                  <Text style={styles.paymentStatusText}>💳 {activeOrder.paymentMethod || 'CASH_ON_DELIVERY'} · {activeOrder.paymentStatus || 'PENDING'}</Text>
                  <View style={styles.communicationRow}>
                    <TouchableOpacity style={styles.communicationPrimary} onPress={() => openChat(activeOrder)}><Text style={styles.communicationPrimaryText}>💬 {lang === 'bn' ? 'চ্যাট' : 'Chat'}</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.communicationSecondary} onPress={() => callOrderParty(activeOrder)}><Text style={styles.communicationSecondaryText}>📞 {lang === 'bn' ? 'কল' : 'Call'}</Text></TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={() => setTrackingVisible(false)}
                >
                  <Text style={styles.continueBtnText}>
                    {lang === 'bn' ? 'আরো কেনাকাটা করুন' : 'Continue Shopping'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default AuthGate;

const styles = StyleSheet.create({
  authSafeArea: { flex: 1, backgroundColor: '#0f172a' },
  authWelcome: { flex: 1, justifyContent: 'flex-end', padding: 24, backgroundColor: '#0f172a' },
  authLogo: { position: 'absolute', top: 70, right: 24, width: 92, height: 92, opacity: 0.9 },
  authKicker: { color: '#6ee7b7', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  authHeroTitle: { color: '#f8fafc', fontSize: 42, lineHeight: 46, fontWeight: '900', maxWidth: 360 },
  authHeroSub: { color: '#cbd5e1', fontSize: 17, marginTop: 12, marginBottom: 22 },
  authLangRow: { flexDirection: 'row', gap: 22, marginBottom: 22 },
  authLang: { color: '#94a3b8', fontSize: 15, fontWeight: '700', paddingBottom: 5 },
  authLangActive: { color: '#ffffff', borderBottomWidth: 2, borderBottomColor: '#10b981' },
  authPrimaryButton: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center' },
  authPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  authPanel: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: width < 390 ? 16 : 24, paddingVertical: 24 },
  authPanelTitle: { color: '#f8fafc', fontSize: 27, fontWeight: '900', marginBottom: 20 },
  authRoleGrid: { flexDirection: width < 420 ? 'column' : 'row', gap: 10, marginBottom: 20 },
  authRoleCard: { flex: width < 420 ? 0 : 1, width: width < 420 ? '100%' : undefined, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingVertical: width < 420 ? 13 : 16, paddingHorizontal: 14, alignItems: 'center' },
  authRoleIcon: { fontSize: 28, marginBottom: 8 },
  authRoleTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  authRoleSub: { color: '#94a3b8', fontSize: 11, textAlign: 'center', marginTop: 4 },
  authLink: { color: '#6ee7b7', textAlign: 'center', fontWeight: '700' },
  authBack: { color: '#6ee7b7', fontWeight: '700', marginBottom: 20 },
  authModeRow: { flexDirection: 'row', gap: 24, borderBottomWidth: 1, borderBottomColor: '#334155', marginBottom: 16 },
  authModeText: { color: '#94a3b8', fontWeight: '800', paddingBottom: 9 },
  authModeActive: { color: '#10b981', borderBottomWidth: 2, borderBottomColor: '#10b981' },
  authInput: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 10, color: '#f8fafc', padding: 13, marginBottom: 11 },
  authPhotoButton: { height: 82, borderRadius: 12, borderWidth: 1, borderColor: '#10b981', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  authPhotoText: { color: '#6ee7b7', fontWeight: '800' },
  authPhoto: { width: 74, height: 74, borderRadius: 37 },
  logoutHeaderBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  logoutHeaderText: { color: '#fca5a5', fontSize: 20, fontWeight: '900' },
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  header: {
    backgroundColor: '#1e293b',
    paddingHorizontal: width < 390 ? 12 : 16,
    paddingTop: Platform.OS === 'android' ? 34 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandIcon: {
    fontSize: 24
  },
  brandTitle: {
    fontSize: width < 390 ? 19 : 22,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5
  },
  tagline: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width < 390 ? 6 : 10
  },
  langBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  langBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700'
  },
  cartHeaderBtn: {
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 10,
    position: 'relative'
  },
  cartIconText: {
    fontSize: 18
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900'
  },
  locationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  locationText: {
    flex: 1,
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  roleBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 3,
    marginTop: 10
  },
  roleTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8
  },
  roleTabActive: {
    backgroundColor: '#10b981'
  },
  roleTabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700'
  },
  roleTabTextActive: {
    color: '#ffffff'
  },
  mainScroll: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  activeOrderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#10b981',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12
  },
  activeOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pulseIcon: {
    fontSize: 22
  },
  activeOrderTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700'
  },
  activeOrderStatus: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2
  },
  statusHighlight: {
    color: '#34d399',
    fontWeight: '800'
  },
  trackOrderArrow: {
    color: '#34d399',
    fontSize: 18,
    fontWeight: '900'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 0,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 10,
    fontSize: 14
  },
  clearSearch: {
    color: '#94a3b8',
    fontSize: 16,
    padding: 4
  },
  searchResultsBox: {
    backgroundColor: '#111827',
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  searchImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  searchInfo: {
    flex: 1,
    marginLeft: 12
  },
  searchProdName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700'
  },
  searchShopName: {
    color: '#38bdf8',
    fontSize: 11,
    marginTop: 2
  },
  searchPrice: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  addBtnSmall: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  addBtnSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  radiusSection: {
    paddingHorizontal: 14,
    marginTop: 16
  },
  sectionHeading: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 8
  },
  radiusChip: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  radiusChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  radiusChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700'
  },
  radiusChipTextActive: {
    color: '#ffffff'
  },
  shopsSection: {
    paddingHorizontal: 14,
    marginTop: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  shopCountBadge: {
    backgroundColor: '#334155',
    color: '#94a3b8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700'
  },
  shopCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  shopImg: {
    width: '100%',
    height: width < 390 ? 118 : 132,
    backgroundColor: '#334155'
  },
  shopBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  distancePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  distancePillText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800'
  },
  openPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  openPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800'
  },
  shopDetails: {
    padding: 12
  },
  shopName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800'
  },
  shopDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16
  },
  shopAddress: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700'
  },
  deliveryText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600'
  },
  viewShopBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 12
  },
  viewShopBtnText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '800'
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  ownerHeaderCard: {
    backgroundColor: '#1e293b',
    margin: width < 390 ? 12 : 16,
    padding: width < 390 ? 13 : 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  ownerProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ownerProfileImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#334155' },
  ownerProfileIcon: { fontSize: 34, width: 48, textAlign: 'center' },
  ownerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800'
  },
  ownerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: width < 390 ? 6 : 10,
    marginTop: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 7,
    borderRadius: 10,
    alignItems: 'center'
  },
  statVal: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900'
  },
  statLbl: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  ownerOrdersSection: {
    paddingHorizontal: width < 390 ? 12 : 16
  },
  profilePhotoButton: { alignItems: 'center', justifyContent: 'center', height: 120, borderRadius: 14, borderWidth: 1, borderColor: '#10b981', borderStyle: 'dashed', marginBottom: 20 },
  profilePhoto: { width: 104, height: 104, borderRadius: 52 },
  closeAccountButton: { alignItems: 'center', padding: 18 },
  refreshLink: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700'
  },
  ownerOrderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: width < 390 ? 12 : 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderIdText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800'
  },
  orderStatusBadge: {
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  orderCustomerAddress: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4
  },
  orderItemsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  orderItemRow: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 2
  },
  orderTotalText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6
  },
  statusBtnGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  statusActionBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  statusActionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800'
  },
  lowStockCardMobile: { backgroundColor: '#2a2111', marginHorizontal: width < 390 ? 12 : 16, marginBottom: 14, borderRadius: 16, borderWidth: 1, borderColor: '#f59e0b', padding: 12 },
  lowStockMobileHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  lowStockMobileTitle: { color: '#fbbf24', fontSize: 16, fontWeight: '900' },
  lowStockMobileSub: { color: '#d6d3d1', fontSize: 11, marginTop: 2 },
  reminderButtonMobile: { borderWidth: 1, borderColor: '#f59e0b', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  reminderButtonMobileText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
  lowStockProductRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 9, marginTop: 7, borderWidth: 1, borderColor: '#44403c' },
  lowStockProductImage: { width: 44, height: 44, borderRadius: 9, backgroundColor: '#334155' },
  lowStockProductInfo: { flex: 1, marginLeft: 9 },
  lowStockProductName: { color: '#f8fafc', fontSize: 13, fontWeight: '800' },
  lowStockProductMeta: { color: '#fbbf24', fontSize: 11, marginTop: 2 },
  restockButtonMobile: { backgroundColor: '#10b981', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  restockButtonMobileText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  restockModalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,.78)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  restockModalCard: { width: '100%', maxWidth: 430, backgroundColor: '#1e293b', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#334155' },
  restockModalTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '900' },
  restockModalProduct: { color: '#10b981', fontSize: 15, fontWeight: '800', marginTop: 8 },
  restockModalMeta: { color: '#94a3b8', fontSize: 12, marginTop: 3, marginBottom: 14 },
  restockModalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  restockCancelBtn: { flex: 1, borderWidth: 1, borderColor: '#475569', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  restockCancelText: { color: '#cbd5e1', fontWeight: '800' },
  restockConfirmBtn: { flex: 1, backgroundColor: '#10b981', borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  restockConfirmText: { color: '#fff', fontWeight: '900' },
  modalSafe: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  shopModalContainer: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700'
  },
  modalHeaderTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    maxWidth: width * 0.5
  },
  modalCartBtn: {
    backgroundColor: '#10b981',
    padding: 6,
    borderRadius: 8,
    position: 'relative'
  },
  modalBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shopBanner: {
    height: 120,
    position: 'relative'
  },
  bannerImg: {
    width: '100%',
    height: '100%'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 10
  },
  bannerShopName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800'
  },
  bannerDistance: {
    color: '#38bdf8',
    fontSize: 11,
    marginTop: 2
  },
  catScroll: {
    maxHeight: 50,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 6
  },
  catTabActive: {
    backgroundColor: '#10b981'
  },
  catIcon: {
    fontSize: 12
  },
  catTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700'
  },
  catTabTextActive: {
    color: '#ffffff'
  },
  prodScroll: {
    flex: 1,
    padding: width < 390 ? 12 : 16
  },
  prodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: width < 390 ? 9 : 12,
    borderRadius: 14,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#334155'
  },
  prodImg: {
    width: width < 390 ? 56 : 64,
    height: width < 390 ? 56 : 64,
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  prodInfo: {
    flex: 1,
    marginLeft: 12
  },
  prodName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700'
  },
  prodUnit: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1
  },
  prodPrice: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2
  },
  prodStock: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1
  },
  addCartBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  addCartBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800'
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  qtyBtnText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '900'
  },
  qtyVal: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 6
  },
  stickyCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  stickyCartCount: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '700'
  },
  stickyCartTotal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900'
  },
  stickyCartBtn: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  stickyCartBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  cartModalContainer: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  cartScroll: {
    flex: 1
  },
  cartScrollContent: {
    padding: 16,
    paddingBottom: 130,
    flexGrow: 1
  },
  emptyCartBox: {
    alignItems: 'center',
    paddingVertical: 80
  },
  cartShopHeader: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10
  },
  cartItemName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700'
  },
  cartItemSub: {
    color: '#94a3b8',
    fontSize: 11
  },
  cartItemTotal: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'right'
  },
  orderTypeContainer: {
    marginTop: 14
  },
  orderTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center'
  },
  typeBtnActive: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b'
  },
  typeBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700'
  },
  typeBtnTextActive: {
    color: '#34d399'
  },
  formSection: {
    marginTop: 14
  },
  formLabel: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  formInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    padding: 10,
    marginBottom: 10,
    fontSize: 13
  },
  billBox: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    marginTop: 10
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  billLabel: {
    color: '#94a3b8',
    fontSize: 13
  },
  billVal: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700'
  },
  billRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  billTotalLabel: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800'
  },
  billTotalVal: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '900'
  },
  paymentBox: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    marginTop: 10
  },
  paymentMethodTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700'
  },
  paymentActiveOption: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4
  },
  checkoutBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900'
  },
  cartEndSpacer: { marginTop: 14, marginBottom: 10, alignItems: 'center' },
  cartEndHint: { color: '#64748b', fontSize: 11, textAlign: 'center' },
  stickyCheckoutBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingTop: 11, paddingBottom: Platform.OS === 'ios' ? 16 : 12, borderTopWidth: 1, borderTopColor: '#334155', backgroundColor: '#111827' },
  stickyCheckoutLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '800' },
  stickyCheckoutTotal: { color: '#34d399', fontSize: 19, fontWeight: '900', marginTop: 1 },
  stickyCheckoutButton: { flex: 1, maxWidth: 260, minHeight: 48, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  stickyCheckoutButtonText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  trackingContainer: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  trackingScroll: {
    flex: 1,
    padding: 16
  },
  orderSummaryCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center'
  },
  trackingOrderNumber: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '900'
  },
  trackingShopName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4
  },
  trackingTotal: {
    color: '#10b981',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6
  },
  timelineBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 6
  },
  timelineLeft: {
    alignItems: 'center',
    width: 36
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepCircleDone: {
    backgroundColor: '#064e3b'
  },
  stepCircleCurrent: {
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#34d399'
  },
  stepCircleText: {
    fontSize: 14
  },
  stepLine: {
    width: 2,
    height: 28,
    backgroundColor: '#334155',
    marginVertical: 2
  },
  stepLineDone: {
    backgroundColor: '#10b981'
  },
  timelineRight: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  stepTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700'
  },
  stepTitleDone: {
    color: '#f8fafc'
  },
  currentStepBadge: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  },
  trackingItemsBox: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    marginTop: 14
  },
  trackingItemText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4
  },
  continueBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 40
  },
  continueBtnText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800'
  },

  // V8 mobile UX: compact, consistent, visible feedback, shortcuts and reduced memory load.
  customerShell: { flex: 1, backgroundColor: '#0f172a' },
  customerScrollContent: { paddingBottom: 96 },
  currentLocationCard: { marginHorizontal: 14, marginTop: 14, backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#334155', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  locationCardIconWrap: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#064e3b', alignItems: 'center', justifyContent: 'center' },
  locationCardIcon: { fontSize: 21 },
  locationCardBody: { flex: 1 },
  locationCardKicker: { color: '#6ee7b7', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.7 },
  locationCardTitle: { color: '#f8fafc', fontSize: 14, lineHeight: 19, fontWeight: '800', marginTop: 2 },
  locationCardMeta: { color: '#94a3b8', fontSize: 10, lineHeight: 14, marginTop: 3 },
  locationRefreshBtn: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  locationRefreshText: { color: '#34d399', fontSize: 22, fontWeight: '800' },
  locationActionRow: { marginHorizontal: 14, marginTop: 8, flexDirection: 'row', gap: 8 },
  locationSecondaryBtn: { flex: 1, minHeight: 40, borderWidth: 1, borderColor: '#334155', backgroundColor: '#111827', borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  locationSecondaryText: { color: '#cbd5e1', fontSize: 12, fontWeight: '800' },
  customerSectionHeaderCompact: { marginHorizontal: 14, marginTop: 18, marginBottom: 7 },
  customerSectionTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  customerSectionHint: { color: '#64748b', fontSize: 11, marginTop: 2 },
  feedbackText: { color: '#34d399', fontSize: 10, fontWeight: '800' },
  sectionSubtle: { color: '#64748b', fontSize: 10, marginTop: 1 },
  shopCountPill: { minWidth: 32, height: 32, borderRadius: 16, backgroundColor: '#064e3b', borderWidth: 1, borderColor: '#047857', alignItems: 'center', justifyContent: 'center' },
  shopCountPillText: { color: '#a7f3d0', fontSize: 12, fontWeight: '900' },
  shopMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#334155' },
  viewShopBtnMuted: { borderColor: '#475569', backgroundColor: '#111827' },
  viewShopBtnTextMuted: { color: '#94a3b8' },
  loadingState: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingStateText: { color: '#94a3b8', fontSize: 12 },
  emptyStateTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  emptyActionRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignSelf: 'stretch' },
  emptyPrimaryBtn: { flex: 1, minHeight: 42, backgroundColor: '#10b981', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emptyPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  emptySecondaryBtn: { flex: 1, minHeight: 42, borderWidth: 1, borderColor: '#10b981', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emptySecondaryText: { color: '#6ee7b7', fontSize: 12, fontWeight: '900' },
  inlineQtyCompact: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 10, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  inlineQtyBtnCompact: { width: 30, height: 34, alignItems: 'center', justifyContent: 'center' },
  inlineQtyTextCompact: { color: '#34d399', fontSize: 19, fontWeight: '900' },
  inlineQtyValueCompact: { minWidth: 24, textAlign: 'center', color: '#f8fafc', fontWeight: '900', fontSize: 12 },
  ordersScreenSection: { paddingHorizontal: 14, paddingTop: 16 },
  ordersScreenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  ordersScreenTitle: { color: '#f8fafc', fontSize: 22, fontWeight: '900' },
  iconRefreshButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  iconRefreshText: { color: '#34d399', fontSize: 22, fontWeight: '900' },
  orderSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 },
  orderTypePill: { color: '#93c5fd', backgroundColor: '#172554', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, fontSize: 10, fontWeight: '800', overflow: 'hidden' },
  customerBottomNav: { position: 'absolute', left: 10, right: 10, bottom: Platform.OS === 'ios' ? 8 : 10, height: 66, borderRadius: 20, backgroundColor: '#111827', borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  customerNavItem: { flex: 1, height: 58, alignItems: 'center', justifyContent: 'center', gap: 2 },
  customerNavIcon: { color: '#94a3b8', fontSize: 21, fontWeight: '900' },
  customerNavActive: { color: '#34d399' },
  customerNavLabel: { color: '#64748b', fontSize: 9, fontWeight: '800' },
  customerNavLabelActive: { color: '#6ee7b7' },
  navDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444', top: 0, right: -5 },
  navBadge: { position: 'absolute', top: -5, right: -10, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  navBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },

  paymentMethodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  paymentChoice: { borderWidth: 1, borderColor: '#334155', paddingVertical: 9, paddingHorizontal: 11, borderRadius: 10, backgroundColor: '#0f172a' },
  paymentChoiceActive: { borderColor: '#10b981', backgroundColor: '#064e3b' },
  paymentChoiceText: { color: '#cbd5e1', fontWeight: '700', fontSize: 12 },
  paymentChoiceTextActive: { color: '#ecfdf5' },
  paymentDemoNote: { color: '#94a3b8', fontSize: 11, lineHeight: 16, marginTop: 9 },
  trackingCommunication: { marginTop: 16, gap: 10 },
  paymentStatusText: { color: '#10b981', fontWeight: '800' },
  communicationRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  communicationPrimary: { flex: 1, backgroundColor: '#10b981', padding: 12, borderRadius: 10, alignItems: 'center' },
  communicationPrimaryText: { color: '#fff', fontWeight: '800' },
  communicationSecondary: { flex: 1, borderWidth: 1, borderColor: '#10b981', padding: 11, borderRadius: 10, alignItems: 'center' },
  communicationSecondaryText: { color: '#10b981', fontWeight: '800' },
  mobileChatMessages: { flex: 1, backgroundColor: '#0f172a' },
  mobileChatBubble: { alignSelf: 'flex-start', maxWidth: '82%', padding: 11, borderRadius: 14, borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b', marginBottom: 9 },
  mobileChatBubbleMine: { alignSelf: 'flex-end', backgroundColor: '#10b981', borderColor: '#10b981' },
  mobileChatMeta: { color: '#94a3b8', fontSize: 10, marginBottom: 4 },
  mobileChatText: { color: '#f8fafc', fontSize: 14 },
  mobileChatComposer: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: '#334155', backgroundColor: '#0f172a' },
  mobileChatInput: { flex: 1, borderWidth: 1, borderColor: '#334155', borderRadius: 10, color: '#f8fafc', paddingHorizontal: 12, backgroundColor: '#1e293b' },
  riderRegistrationBox: { marginTop: 8, gap: 8 },
  mobileSectionCard: { marginHorizontal: 14, marginBottom: 14, padding: 14, backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  mobileOrderMiniCard: { padding: 12, borderRadius: 12, backgroundColor: '#1e293b', marginTop: 10, borderWidth: 1, borderColor: '#334155' },
  mobileOrderShop: { color: '#f8fafc', fontSize: 14, fontWeight: '800', marginTop: 5 },
  riderMeta: { color: '#94a3b8', fontSize: 12, marginTop: 5 },
  availabilityButton: { marginTop: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
  availabilityOn: { backgroundColor: '#065f46' },
  availabilityOff: { backgroundColor: '#7f1d1d' },
  availabilityText: { color: '#fff', fontWeight: '900' },
  offerSentText: { color: '#34d399', fontWeight: '800', marginTop: 10 },
  ownerFilterChip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, backgroundColor: '#1e293b', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  ownerFilterChipActive: { backgroundColor: '#065f46', borderColor: '#10b981' },
  ownerFilterText: { color: '#94a3b8', fontSize: 11, fontWeight: '800' },
  ownerFilterTextActive: { color: '#ecfdf5' },
  riderOfferBox: { padding: 10, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  riderOfferCard: { backgroundColor: '#1e293b', padding: 10, borderRadius: 10, marginTop: 8 },
  cartGroupBox: { backgroundColor: '#111827', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cartGroupTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 14, marginBottom: 6 },
  cartGroupFee: { color: '#94a3b8', fontSize: 11, textAlign: 'right', marginTop: 4 },
  notificationCard: { backgroundColor: '#1e293b', padding: 13, borderRadius: 12, marginBottom: 9, borderWidth: 1, borderColor: '#334155' },
  notificationUnread: { borderColor: '#10b981', backgroundColor: '#064e3b' },
  notificationTitle: { color: '#f8fafc', fontWeight: '900', fontSize: 14 },
  notificationBody: { color: '#cbd5e1', fontSize: 12, marginTop: 4, lineHeight: 18 },
  notificationTime: { color: '#64748b', fontSize: 10, marginTop: 6 },
  analyticsMobileCard: { marginHorizontal: 14, marginTop: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#243244', borderRadius: 16, padding: 14 },
  analyticsMetricGridMobile: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  analyticsMetricMobile: { width: '48%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#263449', borderRadius: 12, padding: 10 },
  analyticsMetricLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  analyticsMetricValue: { color: '#f8fafc', fontSize: 18, fontWeight: '900', marginTop: 3 },
  analyticsProductMobile: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#223044' },
  analyticsRankMobile: { width: 26, height: 26, borderRadius: 13, textAlign: 'center', lineHeight: 26, backgroundColor: '#063c2f', color: '#34d399', fontWeight: '900', fontSize: 12 },
  analyticsProductNameMobile: { flex: 1, color: '#e2e8f0', fontSize: 13, fontWeight: '800' },
  analyticsProductQtyMobile: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  customerCancelWindow: { marginHorizontal: 14, marginTop: -5, marginBottom: 8, padding: 11, borderRadius: 13, borderWidth: 1, borderColor: '#92400e', backgroundColor: '#2a1d0c', flexDirection: 'row', alignItems: 'center', gap: 10 },
  customerCancelWindowTitle: { color: '#fde68a', fontSize: 11, lineHeight: 16, fontWeight: '900' },
  customerCancelWindowSub: { color: '#d6b76b', fontSize: 10, lineHeight: 14, marginTop: 2 },
  customerCancelWindowBtn: { minWidth: 66, minHeight: 38, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ef4444', backgroundColor: '#3b1015', alignItems: 'center', justifyContent: 'center' },
  customerCancelWindowBtnText: { color: '#fecaca', fontSize: 11, fontWeight: '900' },
  cancelEligibilityBox: { marginTop: 8, padding: 9, borderRadius: 10, borderWidth: 1, borderColor: '#92400e', backgroundColor: '#2a1d0c' },
  cancelEligibilityText: { color: '#fde68a', fontSize: 11, lineHeight: 16, fontWeight: '700' },
  cancelClosedText: { color: '#94a3b8', fontSize: 10, lineHeight: 15, marginTop: 8 },
  cancelOrderButton: { marginTop: 8, borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#2b1115', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  cancelOrderButtonText: { color: '#fca5a5', fontWeight: '900', fontSize: 12 },
  cancelReasonBox: { marginTop: 8, padding: 9, borderRadius: 10, backgroundColor: '#2b1115', borderWidth: 1, borderColor: '#7f1d1d' },
  cancelReasonText: { color: '#fecaca', fontSize: 12, lineHeight: 18, fontWeight: '700' },
  cancelModalCard: { width: '92%', maxWidth: 460, backgroundColor: '#111827', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#334155' },
  cancelModalSub: { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginBottom: 10 },
  cancelSuggestionLabel: { color: '#fde68a', fontSize: 11, fontWeight: '900', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 },
  cancelReasonChoice: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, marginBottom: 7 },
  cancelReasonChoiceActive: { borderColor: '#ef4444', backgroundColor: '#35131a' },
  cancelReasonChoiceText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  cancelReasonChoiceTextActive: { color: '#fecaca' },
  cancelConfirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', backgroundColor: '#dc2626' },
  cancelConfirmText: { color: '#fff', fontWeight: '900' },
  walletSenderBox: { marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  paymentHistoryMobileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#223044' },
  paymentHistoryMobileName: { color: '#f8fafc', fontWeight: '900', fontSize: 13 },
  paymentHistoryMobileMeta: { color: '#94a3b8', fontSize: 11, marginTop: 3 },
  paymentHistoryMobileTrx: { color: '#cbd5e1', fontSize: 11, marginTop: 3 },
  paymentHistoryMobileAmount: { color: '#34d399', fontWeight: '900', fontSize: 15 },


  // V14: available-shop map + full seller inventory editor.
  availableMapCard: { marginHorizontal: 14, marginTop: 12, backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#334155', padding: 12, overflow: 'hidden' },
  customerMap: { height: 230, borderRadius: 14, marginTop: 10 },
  mapWebFallback: { marginTop: 10, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#10b981', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  inventoryAddButtonMobile: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  inventoryAddButtonText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  ownerInventoryCardMobile: { marginHorizontal: 14, marginTop: 12, backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#334155', padding: 14 },
  ownerInventoryProductMobile: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#223044' },
  ownerInventoryImageMobile: { width: 52, height: 52, borderRadius: 11, backgroundColor: '#fff' },
  ownerInventoryNameMobile: { color: '#f8fafc', fontSize: 13, fontWeight: '900' },
  ownerInventoryMetaMobile: { color: '#94a3b8', fontSize: 10, marginTop: 3 },
  ownerInventoryAvailabilityMobile: { fontSize: 10, fontWeight: '800', marginTop: 4 },
  ownerInventoryActionsMobile: { gap: 6, alignItems: 'stretch' },
  inventoryEditButtonMobile: { minWidth: 66, minHeight: 34, paddingHorizontal: 9, borderRadius: 9, borderWidth: 1, borderColor: '#10b981', backgroundColor: '#064e3b', alignItems: 'center', justifyContent: 'center' },
  inventoryEditButtonText: { color: '#a7f3d0', fontSize: 10, fontWeight: '900' },
  inventoryRestockMini: { minWidth: 66, minHeight: 32, paddingHorizontal: 8, borderRadius: 9, borderWidth: 1, borderColor: '#475569', backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  inventoryRestockMiniText: { color: '#cbd5e1', fontSize: 10, fontWeight: '800' },
  productEditPhotoBox: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155', borderRadius: 14, backgroundColor: '#111827', padding: 14, marginBottom: 14 },
  productEditPhoto: { width: 112, height: 112, borderRadius: 18, backgroundColor: '#fff' },
  productEditPhotoText: { color: '#6ee7b7', fontSize: 12, fontWeight: '900', marginTop: 10 },

  productAddHero: { marginHorizontal: 16, marginTop: 10, marginBottom: 6, borderRadius: 16, padding: 14, backgroundColor: '#052e2b', borderWidth: 1, borderColor: '#065f46', flexDirection: 'row', alignItems: 'center', gap: 12 },
  productAddHeroIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#10b981', color: '#fff', textAlign: 'center', textAlignVertical: 'center', fontSize: 27, fontWeight: '900', overflow: 'hidden' },
  productAddHeroTitle: { color: '#ecfdf5', fontWeight: '900', fontSize: 14 },
  productAddHeroSub: { color: '#a7f3d0', fontSize: 11, marginTop: 3, lineHeight: 16 },
  productFormSectionHeader: { flexDirection:'row', alignItems:'center', gap:10, marginTop:8, marginBottom:10, padding:10, borderRadius:13, backgroundColor:'#0f2f2a', borderWidth:1, borderColor:'#134e4a' },
  productFormSectionNumber: { width:30, height:30, borderRadius:9, backgroundColor:'#10b981', color:'#fff', textAlign:'center', textAlignVertical:'center', fontWeight:'900', fontSize:11, overflow:'hidden' },
  productFormSectionTitle: { color:'#e2e8f0', fontWeight:'900', fontSize:12 },
  productFormSectionSub: { color:'#94a3b8', fontSize:10, marginTop:2 },
  productCategoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 6 },
  productCategoryChoice: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  productCategoryChoiceActive: { borderColor: '#10b981', backgroundColor: '#064e3b' },
  productCategoryChoiceText: { color: '#cbd5e1', fontSize: 10, fontWeight: '800' },
  productCategoryChoiceTextActive: { color: '#a7f3d0' },
  productAvailabilityToggleMobile: { marginTop: 14, borderRadius: 12, borderWidth: 1, padding: 13 },
  productAvailabilityOnMobile: { backgroundColor: '#064e3b', borderColor: '#10b981' },
  productAvailabilityOffMobile: { backgroundColor: '#3b1015', borderColor: '#ef4444' },
  productAvailabilityTextMobile: { color: '#f8fafc', fontSize: 13, fontWeight: '900' },
  productAvailabilityHelpMobile: { color: '#94a3b8', fontSize: 10, marginTop: 3 },
  deleteProductButtonMobile: { marginTop: 10, marginBottom: 30, borderRadius: 11, borderWidth: 1, borderColor: '#7f1d1d', backgroundColor: '#2b1115', paddingVertical: 12, alignItems: 'center' },
  deleteProductButtonText: { color: '#fca5a5', fontWeight: '900', fontSize: 12 },


  sharedProfileMiniRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8, marginBottom: 5 },
  sharedProfileMiniAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b' },
  sharedProfileMiniFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', textAlign: 'center', lineHeight: 36, fontSize: 18, overflow: 'hidden' },
  sharedProfileMiniName: { color: '#f8fafc', fontSize: 12, fontWeight: '900' },

});
