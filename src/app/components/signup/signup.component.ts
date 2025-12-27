import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { SignupService, SignupData } from '../../services/signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: false
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  emailChecking = false;
  emailAvailable: boolean | null = null;
  phoneNumberChecking = false;
  phoneNumberAvailable: boolean | null = null;

  countries = [
    'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'China', 'Brazil', 'Mexico', 'Spain',
    'Italy', 'Russia', 'South Korea', 'Indonesia', 'Turkey', 'Saudi Arabia',
    'Argentina', 'South Africa', 'Egypt', 'Poland', 'Netherlands', 'Belgium',
    'Sweden', 'Switzerland', 'Austria', 'Norway', 'Denmark', 'Finland',
    'Portugal', 'Greece', 'Ireland', 'New Zealand', 'Singapore', 'Malaysia',
    'Thailand', 'Philippines', 'Vietnam', 'Bangladesh', 'Pakistan', 'Sri Lanka',
    'Nepal', 'Myanmar', 'Cambodia', 'Laos', 'Afghanistan', 'Iran', 'Iraq',
    'Israel', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Jordan',
    'Lebanon', 'Syria', 'Yemen', 'Chile', 'Colombia', 'Peru', 'Venezuela',
    'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Cuba', 'Jamaica', 'Haiti',
    'Dominican Republic', 'Puerto Rico', 'Panama', 'Costa Rica', 'Guatemala',
    'Honduras', 'El Salvador', 'Nicaragua', 'Belize', 'Trinidad and Tobago',
    'Nigeria', 'Kenya', 'Ethiopia', 'Ghana', 'Tanzania', 'Uganda', 'Morocco',
    'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Angola', 'Mozambique', 'Zimbabwe',
    'Zambia', 'Botswana', 'Namibia', 'Senegal', 'Ivory Coast', 'Cameroon',
    'Ukraine', 'Romania', 'Czech Republic', 'Hungary', 'Bulgaria', 'Croatia',
    'Serbia', 'Slovakia', 'Slovenia', 'Lithuania', 'Latvia', 'Estonia',
    'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan',
    'Uzbekistan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Mongolia',
    'North Korea', 'Taiwan', 'Hong Kong', 'Macau', 'Myanmar', 'Brunei',
    'East Timor', 'Papua New Guinea', 'Fiji', 'Samoa', 'Tonga', 'Vanuatu'
  ];

  states: { [key: string]: string[] } = {
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
    'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
    'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory'],
    'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
    'France': ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine', 'Hauts-de-France', 'Grand Est', 'Pays de la Loire', 'Normandy', 'Brittany', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Corsica'],
    'Japan': ['Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima', 'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa', 'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu', 'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi', 'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'],
    'China': ['Beijing', 'Shanghai', 'Tianjin', 'Chongqing', 'Guangdong', 'Jiangsu', 'Zhejiang', 'Shandong', 'Henan', 'Sichuan', 'Hubei', 'Hunan', 'Anhui', 'Fujian', 'Liaoning', 'Shaanxi', 'Heilongjiang', 'Jilin', 'Jiangxi', 'Shanxi', 'Yunnan', 'Guangxi', 'Guizhou', 'Xinjiang', 'Inner Mongolia', 'Tibet', 'Gansu', 'Qinghai', 'Ningxia', 'Hainan', 'Hong Kong', 'Macau', 'Taiwan'],
    'Brazil': ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
    'Mexico': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
    'Spain': ['Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands', 'Cantabria', 'Castile and León', 'Castile-La Mancha', 'Catalonia', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Murcia', 'Navarre', 'Valencia'],
    'Italy': ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont', 'Puglia', 'Sardinia', 'Sicily', 'Trentino-Alto Adige', 'Tuscany', 'Umbria', 'Valle d\'Aosta', 'Veneto'],
    'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Voronezh', 'Perm', 'Volgograd', 'Krasnodar', 'Saratov', 'Tyumen', 'Tolyatti', 'Izhevsk'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Sejong', 'Gyeonggi', 'Gangwon', 'Chungcheongbuk', 'Chungcheongnam', 'Jeollabuk', 'Jeollanam', 'Gyeongsangbuk', 'Gyeongsangnam', 'Jeju'],
    'Indonesia': ['Aceh', 'Bali', 'Bangka Belitung', 'Banten', 'Bengkulu', 'Central Java', 'Central Kalimantan', 'Central Sulawesi', 'East Java', 'East Kalimantan', 'East Nusa Tenggara', 'Gorontalo', 'Jakarta', 'Jambi', 'Lampung', 'Maluku', 'North Kalimantan', 'North Maluku', 'North Sulawesi', 'North Sumatra', 'Papua', 'Riau', 'Riau Islands', 'South Kalimantan', 'South Sulawesi', 'South Sumatra', 'Southeast Sulawesi', 'West Java', 'West Kalimantan', 'West Nusa Tenggara', 'West Papua', 'West Sulawesi', 'West Sumatra', 'Yogyakarta'],
    'Turkey': ['Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'İçel', 'Istanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'],
    'Saudi Arabia': ['Al Bahah', 'Al Jawf', 'Al Madinah', 'Al Qassim', 'Eastern Province', 'Ha\'il', 'Jazan', 'Makkah', 'Najran', 'Northern Borders', 'Riyadh', 'Tabuk'],
    'Argentina': ['Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'],
    'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'],
    'Egypt': ['Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag', 'South Sinai', 'Suez'],
    'Poland': ['Lower Silesia', 'Kuyavia-Pomerania', 'Lublin', 'Lubusz', 'Łódź', 'Lesser Poland', 'Masovia', 'Opole', 'Subcarpathia', 'Podlaskie', 'Pomerania', 'Silesia', 'Świętokrzyskie', 'Warmia-Masuria', 'Greater Poland', 'West Pomerania'],
    'Netherlands': ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland'],
    'Belgium': ['Antwerp', 'Brussels', 'East Flanders', 'Flemish Brabant', 'Hainaut', 'Liège', 'Limburg', 'Luxembourg', 'Namur', 'Walloon Brabant', 'West Flanders'],
    'Sweden': ['Blekinge', 'Dalarna', 'Gotland', 'Gävleborg', 'Halland', 'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland'],
    'Switzerland': ['Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft', 'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zürich'],
    'Austria': ['Burgenland', 'Carinthia', 'Lower Austria', 'Salzburg', 'Styria', 'Tyrol', 'Upper Austria', 'Vienna', 'Vorarlberg'],
    'Norway': ['Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Vestland', 'Viken'],
    'Denmark': ['Capital Region', 'Central Denmark', 'North Denmark', 'Region Zealand', 'South Denmark'],
    'Finland': ['Åland', 'Central Finland', 'Central Ostrobothnia', 'Kainuu', 'Kymenlaakso', 'Lapland', 'North Karelia', 'North Ostrobothnia', 'North Savo', 'Ostrobothnia', 'Päijät-Häme', 'Pirkanmaa', 'Satakunta', 'South Karelia', 'South Ostrobothnia', 'South Savo', 'Southwest Finland', 'Tavastia Proper', 'Uusimaa'],
    'Portugal': ['Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisbon', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Azores', 'Madeira'],
    'Greece': ['Attica', 'Central Greece', 'Central Macedonia', 'Crete', 'East Macedonia and Thrace', 'Epirus', 'Ionian Islands', 'North Aegean', 'Peloponnese', 'South Aegean', 'Thessaly', 'West Greece', 'West Macedonia'],
    'Ireland': ['Connacht', 'Leinster', 'Munster', 'Ulster'],
    'New Zealand': ['Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay', 'Manawatu-Wanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast'],
    'Singapore': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
    'Malaysia': ['Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'],
    'Thailand': ['Bangkok', 'Amnat Charoen', 'Ang Thong', 'Bueng Kan', 'Buriram', 'Chachoengsao', 'Chai Nat', 'Chaiyaphum', 'Chanthaburi', 'Chiang Mai', 'Chiang Rai', 'Chonburi', 'Chumphon', 'Kalasin', 'Kamphaeng Phet', 'Kanchanaburi', 'Khon Kaen', 'Krabi', 'Lampang', 'Lamphun', 'Loei', 'Lopburi', 'Mae Hong Son', 'Maha Sarakham', 'Mukdahan', 'Nakhon Nayok', 'Nakhon Pathom', 'Nakhon Phanom', 'Nakhon Ratchasima', 'Nakhon Sawan', 'Nakhon Si Thammarat', 'Nan', 'Narathiwat', 'Nong Bua Lamphu', 'Nong Khai', 'Nonthaburi', 'Pathum Thani', 'Pattani', 'Phang Nga', 'Phatthalung', 'Phayao', 'Phetchabun', 'Phetchaburi', 'Phichit', 'Phitsanulok', 'Phra Nakhon Si Ayutthaya', 'Phrae', 'Phuket', 'Prachuap Khiri Khan', 'Ranong', 'Ratchaburi', 'Rayong', 'Roi Et', 'Sa Kaeo', 'Sakon Nakhon', 'Samut Prakan', 'Samut Sakhon', 'Samut Songkhram', 'Saraburi', 'Satun', 'Si Sa Ket', 'Sing Buri', 'Songkhla', 'Sukhothai', 'Suphan Buri', 'Surat Thani', 'Surin', 'Tak', 'Trang', 'Trat', 'Ubon Ratchathani', 'Udon Thani', 'Uthai Thani', 'Uttaradit', 'Yala', 'Yasothon'],
    'Philippines': ['Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique', 'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet', 'Biliran', 'Bohol', 'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte', 'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu', 'Compostela Valley', 'Cotabato', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar', 'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte', 'Maguindanao', 'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental', 'Misamis Oriental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental', 'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor', 'Sorsogon', 'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
    'Vietnam': ['An Giang', 'Bà Rịa–Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên–Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái', 'Cần Thơ', 'Đà Nẵng', 'Hà Nội', 'Hải Phòng', 'Hồ Chí Minh City'],
    'Bangladesh': ['Barisal', 'Chittagong', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'],
    'Pakistan': ['Balochistan', 'Gilgit-Baltistan', 'Islamabad', 'Khyber Pakhtunkhwa', 'Punjab', 'Sindh'],
    'Sri Lanka': ['Central', 'Eastern', 'North Central', 'Northern', 'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western'],
    'Nepal': ['Bagmati', 'Bheri', 'Dhawalagiri', 'Gandaki', 'Janakpur', 'Karnali', 'Koshi', 'Lumbini', 'Mahakali', 'Mechi', 'Narayani', 'Rapti', 'Sagarmatha', 'Seti'],
    'Myanmar': ['Ayeyarwady', 'Bago', 'Chin', 'Kachin', 'Kayah', 'Kayin', 'Magway', 'Mandalay', 'Mon', 'Naypyidaw', 'Rakhine', 'Sagaing', 'Shan', 'Tanintharyi', 'Yangon'],
    'Cambodia': ['Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang', 'Kampong Speu', 'Kampong Thom', 'Kampot', 'Kandal', 'Koh Kong', 'Kratié', 'Mondulkiri', 'Oddar Meanchey', 'Pailin', 'Phnom Penh', 'Preah Sihanouk', 'Preah Vihear', 'Pursat', 'Ratanakiri', 'Siem Reap', 'Stung Treng', 'Svay Rieng', 'Takéo', 'Tbong Khmum'],
    'Laos': ['Attapeu', 'Bokeo', 'Bolikhamsai', 'Champasak', 'Houaphanh', 'Khammouane', 'Luang Namtha', 'Luang Prabang', 'Oudomxay', 'Phongsaly', 'Salavan', 'Savannakhet', 'Sekong', 'Vientiane', 'Vientiane Capital', 'Xaisomboun', 'Xiangkhouang'],
    'Afghanistan': ['Badakhshan', 'Badghis', 'Baghlan', 'Balkh', 'Bamyan', 'Daykundi', 'Farah', 'Faryab', 'Ghazni', 'Ghor', 'Helmand', 'Herat', 'Jowzjan', 'Kabul', 'Kandahar', 'Kapisa', 'Khost', 'Kunar', 'Kunduz', 'Laghman', 'Logar', 'Nangarhar', 'Nimruz', 'Nuristan', 'Paktia', 'Paktika', 'Panjshir', 'Parwan', 'Samangan', 'Sar-e Pol', 'Takhar', 'Uruzgan', 'Wardak', 'Zabul'],
    'Iran': ['Alborz', 'Ardabil', 'Bushehr', 'Chaharmahal and Bakhtiari', 'East Azerbaijan', 'Fars', 'Gilan', 'Golestan', 'Hamadan', 'Hormozgan', 'Ilam', 'Isfahan', 'Kerman', 'Kermanshah', 'Khuzestan', 'Kohgiluyeh and Boyer-Ahmad', 'Kurdistan', 'Lorestan', 'Markazi', 'Mazandaran', 'North Khorasan', 'Qazvin', 'Qom', 'Razavi Khorasan', 'Semnan', 'Sistan and Baluchestan', 'South Khorasan', 'Tehran', 'West Azerbaijan', 'Yazd', 'Zanjan'],
    'Iraq': ['Al Anbar', 'Babylon', 'Baghdad', 'Basra', 'Dhi Qar', 'Al-Qādisiyyah', 'Diyala', 'Dohuk', 'Erbil', 'Halabja', 'Karbala', 'Kirkuk', 'Maysan', 'Muthanna', 'Najaf', 'Nineveh', 'Saladin', 'Sulaymaniyah', 'Wasit'],
    'Israel': ['Central', 'Haifa', 'Jerusalem', 'Northern', 'Southern', 'Tel Aviv'],
    'United Arab Emirates': ['Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'],
    'Qatar': ['Ad Dawhah', 'Al Khawr wa adh Dhakhīrah', 'Ash Shamāl', 'Az̧ Za̧`āyin', 'Ar Rayyān', 'Umm Şalāl', 'Al Wakrah'],
    'Kuwait': ['Al Ahmadi', 'Al Farwaniyah', 'Al Jahra', 'Capital', 'Hawalli', 'Mubarak Al-Kabeer'],
    'Oman': ['Ad Dakhiliyah', 'Ad Dhahirah', 'Al Batinah North', 'Al Batinah South', 'Al Buraimi', 'Al Wusta', 'Ash Sharqiyah North', 'Ash Sharqiyah South', 'Dhofar', 'Musandam', 'Muscat'],
    'Jordan': ['Ajloun', 'Amman', 'Aqaba', 'Balqa', 'Irbid', 'Jerash', 'Karak', 'Ma\'an', 'Madaba', 'Mafraq', 'Tafilah', 'Zarqa'],
    'Lebanon': ['Akkar', 'Baalbek-Hermel', 'Beirut', 'Beqaa', 'Mount Lebanon', 'Nabatieh', 'North', 'South'],
    'Syria': ['Aleppo', 'As-Suwayda', 'Damascus', 'Daraa', 'Deir ez-Zor', 'Hama', 'Al-Hasakah', 'Homs', 'Idlib', 'Latakia', 'Quneitra', 'Raqqa', 'Rif Dimashq', 'Tartus'],
    'Yemen': ['Abyan', 'Aden', 'Al Bayda', 'Al Hudaydah', 'Al Jawf', 'Al Mahrah', 'Al Mahwit', 'Amran', 'Dhamar', 'Hadhramaut', 'Hajjah', 'Ibb', 'Lahij', 'Marib', 'Raymah', 'Saada', 'Sana\'a', 'Shabwah', 'Socotra', 'Taiz'],
    'Chile': ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes y la Antártica Chilena'],
    'Colombia': ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'],
    'Peru': ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'],
    'Venezuela': ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia', 'Distrito Capital', 'Dependencias Federales'],
    'Ecuador': ['Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'],
    'Uruguay': ['Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'],
    'Paraguay': ['Alto Paraguay', 'Alto Paraná', 'Amambay', 'Asunción', 'Boquerón', 'Caaguazú', 'Caazapá', 'Canindeyú', 'Central', 'Concepción', 'Cordillera', 'Guairá', 'Itapúa', 'Misiones', 'Ñeembucú', 'Paraguarí', 'Presidente Hayes', 'San Pedro'],
    'Bolivia': ['Beni', 'Chuquisaca', 'Cochabamba', 'La Paz', 'Oruro', 'Pando', 'Potosí', 'Santa Cruz', 'Tarija'],
    'Cuba': ['Artemisa', 'Camagüey', 'Ciego de Ávila', 'Cienfuegos', 'Granma', 'Guantánamo', 'Havana', 'Holguín', 'Isla de la Juventud', 'Las Tunas', 'Matanzas', 'Mayabeque', 'Pinar del Río', 'Sancti Spíritus', 'Santiago de Cuba', 'Villa Clara'],
    'Jamaica': ['Clarendon', 'Hanover', 'Kingston', 'Manchester', 'Portland', 'Saint Andrew', 'Saint Ann', 'Saint Catherine', 'Saint Elizabeth', 'Saint James', 'Saint Mary', 'Saint Thomas', 'Trelawny', 'Westmoreland'],
    'Haiti': ['Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord', 'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'],
    'Dominican Republic': ['Azua', 'Baoruco', 'Barahona', 'Dajabón', 'Distrito Nacional', 'Duarte', 'El Seibo', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal', 'Independencia', 'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi', 'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná', 'San Cristóbal', 'San José de Ocoa', 'San Juan', 'San Pedro de Macorís', 'Sánchez Ramírez', 'Santiago', 'Santiago Rodríguez', 'Santo Domingo', 'Valverde'],
    'Puerto Rico': ['Adjuntas', 'Aguada', 'Aguadilla', 'Aguas Buenas', 'Aibonito', 'Arecibo', 'Arroyo', 'Barceloneta', 'Barranquitas', 'Bayamón', 'Cabo Rojo', 'Caguas', 'Camuy', 'Canóvanas', 'Carolina', 'Cataño', 'Cayey', 'Ceiba', 'Cidra', 'Coamo', 'Comerío', 'Corozal', 'Culebra', 'Dorado', 'Fajardo', 'Florida', 'Guánica', 'Guayama', 'Guayanilla', 'Guaynabo', 'Gurabo', 'Hatillo', 'Hormigueros', 'Humacao', 'Isabela', 'Jayuya', 'Juana Díaz', 'Juncos', 'Lajas', 'Lares', 'Las Marías', 'Las Piedras', 'Loíza', 'Luquillo', 'Manatí', 'Maricao', 'Maunabo', 'Mayagüez', 'Moca', 'Morovis', 'Naguabo', 'Naranjito', 'Orocovis', 'Patillas', 'Peñuelas', 'Ponce', 'Quebradillas', 'Rincón', 'Río Grande', 'Sabana Grande', 'Salinas', 'San Germán', 'San Juan', 'San Lorenzo', 'San Sebastián', 'Santa Isabel', 'Toa Alta', 'Toa Baja', 'Trujillo Alto', 'Utuado', 'Vega Alta', 'Vega Baja', 'Vieques', 'Villalba', 'Yabucoa', 'Yauco'],
    'Panama': ['Bocas del Toro', 'Chiriquí', 'Coclé', 'Colón', 'Darién', 'Emberá', 'Guna Yala', 'Herrera', 'Los Santos', 'Ngäbe-Buglé', 'Panamá', 'Panamá Oeste', 'Veraguas'],
    'Costa Rica': ['Alajuela', 'Cartago', 'Guanacaste', 'Heredia', 'Limón', 'Puntarenas', 'San José'],
    'Guatemala': ['Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'El Progreso', 'Escuintla', 'Guatemala', 'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quetzaltenango', 'Quiché', 'Retalhuleu', 'Sacatepéquez', 'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez', 'Totonicapán', 'Zacapa'],
    'Honduras': ['Atlántida', 'Choluteca', 'Colón', 'Comayagua', 'Copán', 'Cortés', 'El Paraíso', 'Francisco Morazán', 'Gracias a Dios', 'Intibucá', 'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque', 'Olancho', 'Santa Bárbara', 'Valle', 'Yoro'],
    'El Salvador': ['Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz', 'La Unión', 'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután'],
    'Nicaragua': ['Boaco', 'Carazo', 'Chinandega', 'Chontales', 'Estelí', 'Granada', 'Jinotega', 'León', 'Madriz', 'Managua', 'Masaya', 'Matagalpa', 'Nueva Segovia', 'Río San Juan', 'Rivas', 'North Caribbean Coast', 'South Caribbean Coast'],
    'Belize': ['Belize', 'Cayo', 'Corozal', 'Orange Walk', 'Stann Creek', 'Toledo'],
    'Trinidad and Tobago': ['Arima', 'Chaguanas', 'Couva-Tabaquite-Talparo', 'Diego Martin', 'Eastern Tobago', 'Mayaro-Rio Claro', 'Penal-Debe', 'Princes Town', 'Rio Claro-Mayaro', 'San Fernando', 'San Juan-Laventille', 'Sangre Grande', 'Siparia', 'Tunapuna-Piarco', 'Western Tobago'],
    'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
    'Kenya': ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'],
    'Ethiopia': ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Somali', 'Southern Nations, Nationalities, and Peoples', 'Tigray'],
    'Ghana': ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'North East', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'],
    'Tanzania': ['Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Mjini Magharibi', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South'],
    'Uganda': ['Abim', 'Adjumani', 'Agago', 'Alebtong', 'Amolatar', 'Amudat', 'Amuria', 'Amuru', 'Apac', 'Arua', 'Budaka', 'Bududa', 'Bugiri', 'Bugweri', 'Buhweju', 'Buikwe', 'Bukedea', 'Bukomansimbi', 'Bukwo', 'Bulambuli', 'Buliisa', 'Bundibugyo', 'Bunyangabu', 'Bushenyi', 'Busia', 'Butaleja', 'Butambala', 'Butebo', 'Buvuma', 'Buyende', 'Dokolo', 'Gomba', 'Gulu', 'Hoima', 'Ibanda', 'Iganga', 'Isingiro', 'Jinja', 'Kaabong', 'Kabale', 'Kabarole', 'Kaberamaido', 'Kagadi', 'Kakumiro', 'Kalangala', 'Kaliro', 'Kalungu', 'Kampala', 'Kamuli', 'Kamwenge', 'Kanungu', 'Kapchorwa', 'Kapelebyong', 'Karenga', 'Kasanda', 'Kasese', 'Katakwi', 'Kazo', 'Kibaale', 'Kiboga', 'Kibuku', 'Kikuube', 'Kiruhura', 'Kiryandongo', 'Kisoro', 'Kitgum', 'Koboko', 'Kole', 'Kotido', 'Kumi', 'Kwania', 'Kween', 'Kyankwanzi', 'Kyegegwa', 'Kyenjojo', 'Kyotera', 'Lamwo', 'Lira', 'Luuka', 'Luwero', 'Lwengo', 'Lyantonde', 'Madi-Okollo', 'Manafwa', 'Maracha', 'Maracha-Terego', 'Masaka', 'Masindi', 'Mayuge', 'Mbale', 'Mbarara', 'Mitooma', 'Mityana', 'Moroto', 'Moyo', 'Mpigi', 'Mubende', 'Mukono', 'Nabilatuk', 'Nakapiripirit', 'Nakaseke', 'Nakasongola', 'Namayingo', 'Namisindwa', 'Namutumba', 'Napak', 'Nebbi', 'Ngora', 'Ntoroko', 'Ntungamo', 'Nwoya', 'Omoro', 'Otuke', 'Oyam', 'Pader', 'Pakwach', 'Pallisa', 'Rakai', 'Rubanda', 'Rubirizi', 'Rukiga', 'Rukungiri', 'Rwampara', 'Sembabule', 'Serere', 'Sheema', 'Sironko', 'Soroti', 'Tororo', 'Wakiso', 'Yumbe', 'Zombo'],
    'Morocco': ['Tanger-Tétouan-Al Hoceïma', 'Oriental', 'Fès-Meknès', 'Rabat-Salé-Kénitra', 'Béni Mellal-Khénifra', 'Casablanca-Settat', 'Marrakech-Safi', 'Drâa-Tafilalet', 'Souss-Massa', 'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab'],
    'Algeria': ['Adrar', 'Aïn Defla', 'Aïn Témouchent', 'Algiers', 'Annaba', 'Batna', 'Béchar', 'Béjaïa', 'Biskra', 'Blida', 'Bordj Bou Arréridj', 'Bouira', 'Boumerdès', 'Chlef', 'Constantine', 'Djelfa', 'El Bayadh', 'El Oued', 'El Tarf', 'Ghardaïa', 'Guelma', 'Illizi', 'Jijel', 'Khenchela', 'Laghouat', 'Mascara', 'Médéa', 'Mila', 'Mostaganem', 'Msila', 'Naâma', 'Oran', 'Ouargla', 'Oum El Bouaghi', 'Relizane', 'Saïda', 'Sétif', 'Sidi Bel Abbès', 'Skikda', 'Souk Ahras', 'Tamanghasset', 'Tébessa', 'Tiaret', 'Tindouf', 'Tipaza', 'Tissemsilt', 'Tizi Ouzou', 'Tlemcen', 'Touggourt'],
    'Tunisia': ['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'],
    'Libya': ['Al Butnan', 'Al Jabal al Akhdar', 'Al Jabal al Gharbi', 'Al Jafarah', 'Al Jufrah', 'Al Kufrah', 'Al Marj', 'Al Marqab', 'Al Wahat', 'An Nuqat al Khams', 'Az Zawiyah', 'Benghazi', 'Darnah', 'Ghat', 'Misrata', 'Murzuq', 'Nalut', 'Sabha', 'Sabratha and Surman', 'Sirte', 'Tripoli', 'Wadi al Hayat', 'Wadi ash Shati'],
    'Sudan': ['Al Jazirah', 'Al Qadarif', 'Blue Nile', 'Central Darfur', 'East Darfur', 'Kassala', 'Khartoum', 'North Darfur', 'North Kordofan', 'Northern', 'Red Sea', 'River Nile', 'Sennar', 'South Darfur', 'South Kordofan', 'West Darfur', 'West Kordofan', 'White Nile'],
    'Angola': ['Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'],
    'Mozambique': ['Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 'Maputo City', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambézia'],
    'Zimbabwe': ['Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'],
    'Zambia': ['Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western'],
    'Botswana': ['Central', 'Ghanzi', 'Kgalagadi', 'Kgatleng', 'Kweneng', 'North East', 'North West', 'South East', 'Southern'],
    'Namibia': ['Erongo', 'Hardap', '//Karas', 'Kavango East', 'Kavango West', 'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati', 'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'],
    'Senegal': ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'],
    'Ivory Coast': ['Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua', 'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué', 'Savanes', 'Vallée du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan'],
    'Cameroon': ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'],
    'Ukraine': ['Cherkasy', 'Chernihiv', 'Chernivtsi', 'Crimea', 'Dnipropetrovsk', 'Donetsk', 'Ivano-Frankivsk', 'Kharkiv', 'Kherson', 'Khmelnytskyi', 'Kiev', 'Kirovohrad', 'Luhansk', 'Lviv', 'Mykolaiv', 'Odessa', 'Poltava', 'Rivne', 'Sumy', 'Ternopil', 'Vinnytsia', 'Volyn', 'Zakarpattia', 'Zaporizhzhia', 'Zhytomyr'],
    'Romania': ['Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 'Brăila', 'Bucharest', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'],
    'Czech Republic': ['Central Bohemian', 'Hradec Králové', 'Karlovy Vary', 'Liberec', 'Moravian-Silesian', 'Olomouc', 'Pardubice', 'Plzeň', 'Prague', 'South Bohemian', 'South Moravian', 'Ústí nad Labem', 'Vysočina', 'Zlín'],
    'Hungary': ['Bács-Kiskun', 'Baranya', 'Békés', 'Borsod-Abaúj-Zemplén', 'Csongrád-Csanád', 'Fejér', 'Győr-Moson-Sopron', 'Hajdú-Bihar', 'Heves', 'Jász-Nagykun-Szolnok', 'Komárom-Esztergom', 'Nógrád', 'Pest', 'Somogy', 'Szabolcs-Szatmár-Bereg', 'Tolna', 'Vas', 'Veszprém', 'Zala', 'Budapest'],
    'Bulgaria': ['Blagoevgrad', 'Burgas', 'Dobrich', 'Gabrovo', 'Haskovo', 'Kardzhali', 'Kyustendil', 'Lovech', 'Montana', 'Pazardzhik', 'Pernik', 'Pleven', 'Plovdiv', 'Razgrad', 'Ruse', 'Shumen', 'Silistra', 'Sliven', 'Smolyan', 'Sofia', 'Sofia City', 'Stara Zagora', 'Targovishte', 'Varna', 'Veliko Tarnovo', 'Vidin', 'Vratsa', 'Yambol'],
    'Croatia': ['Bjelovar-Bilogora', 'Brod-Posavina', 'Dubrovnik-Neretva', 'Istria', 'Karlovac', 'Koprivnica-Križevci', 'Krapina-Zagorje', 'Lika-Senj', 'Međimurje', 'Osijek-Baranja', 'Požega-Slavonia', 'Primorje-Gorski Kotar', 'Šibenik-Knin', 'Sisak-Moslavina', 'Split-Dalmatia', 'Varaždin', 'Virovitica-Podravina', 'Vukovar-Srijem', 'Zadar', 'Zagreb', 'Zagreb City'],
    'Serbia': ['Belgrade', 'Bor', 'Braničevo', 'Jablanica', 'Kolubara', 'Mačva', 'Moravica', 'Nišava', 'Pčinja', 'Pirot', 'Podunavlje', 'Pomoravlje', 'Rasina', 'Raška', 'Šumadija', 'Toplica', 'Zaječar', 'Zapadna Bačka', 'Zlatibor', 'Central Banat', 'North Bačka', 'North Banat', 'South Bačka', 'South Banat', 'Srem', 'West Bačka'],
    'Slovakia': ['Banská Bystrica', 'Bratislava', 'Košice', 'Nitra', 'Prešov', 'Trenčín', 'Trnava', 'Žilina'],
    'Slovenia': ['Central Slovenia', 'Coastal-Karst', 'Drava', 'Gorizia', 'Inner Carniola-Karst', 'Lower Sava', 'Mura', 'Savinja', 'Southeast Slovenia', 'Upper Carniola'],
    'Lithuania': ['Alytus', 'Kaunas', 'Klaipėda', 'Marijampolė', 'Panevėžys', 'Šiauliai', 'Tauragė', 'Telšiai', 'Utena', 'Vilnius'],
    'Latvia': ['Aglona', 'Aizkraukle', 'Aizpute', 'Aknīste', 'Aloja', 'Alsunga', 'Alūksne', 'Amatas', 'Ape', 'Auce', 'Ādaži', 'Babīte', 'Baldone', 'Baltinava', 'Balvi', 'Bauska', 'Beverīna', 'Brocēni', 'Burtnieki', 'Carnikava', 'Cēsis', 'Cesvaine', 'Cēsu', 'Cibla', 'Dagda', 'Daugavpils', 'Daugavpils Municipality', 'Dobele', 'Dundaga', 'Durbe', 'Engure', 'Ērgļi', 'Garkalne', 'Grobiņa', 'Gulbene', 'Iecava', 'Ikšķile', 'Ilūkste', 'Inčukalns', 'Jaunjelgava', 'Jaunpiebalga', 'Jaunpils', 'Jēkabpils', 'Jēkabpils Municipality', 'Jelgava', 'Jelgava Municipality', 'Jūrmala', 'Kandava', 'Kārsava', 'Kocēni', 'Koknese', 'Krāslava', 'Krimulda', 'Krustpils', 'Kuldīga', 'Ķegums', 'Ķekava', 'Lielvārde', 'Liepāja', 'Limbaži', 'Līgatne', 'Līvāni', 'Lubāna', 'Ludza', 'Madona', 'Mālpils', 'Mārupe', 'Mazsalaca', 'Mērsrags', 'Naukšēni', 'Nereta', 'Nīca', 'Ogre', 'Olaine', 'Ozolnieki', 'Pārgauja', 'Pāvilosta', 'Pļaviņas', 'Preiļi', 'Priekule', 'Priekuļi', 'Rauna', 'Rēzekne', 'Rēzekne Municipality', 'Riebiņi', 'Riga', 'Rojas', 'Ropaži', 'Rucava', 'Rugāji', 'Rūjiena', 'Rundāle', 'Salacgrīva', 'Sala', 'Salaspils', 'Saldus', 'Saulkrasti', 'Sēja', 'Sigulda', 'Skrīveri', 'Skrunda', 'Smiltene', 'Stopiņi', 'Strenči', 'Talsi', 'Tērvete', 'Tukums', 'Vaiņode', 'Valka', 'Valmiera', 'Varakļāni', 'Vārkava', 'Vecpiebalga', 'Vecumnieki', 'Ventspils', 'Ventspils Municipality', 'Viesīte', 'Viļaka', 'Viļāni', 'Zilupe'],
    'Estonia': ['Harju', 'Hiiu', 'Ida-Viru', 'Jõgeva', 'Järva', 'Lääne', 'Lääne-Viru', 'Põlva', 'Pärnu', 'Rapla', 'Saare', 'Tartu', 'Valga', 'Viljandi', 'Võru'],
    'Belarus': ['Brest', 'Gomel', 'Grodno', 'Minsk', 'Minsk City', 'Mogilev', 'Vitebsk'],
    'Moldova': ['Anenii Noi', 'Bălți', 'Basarabeasca', 'Bender', 'Briceni', 'Cahul', 'Călărași', 'Cantemir', 'Căușeni', 'Chișinău', 'Cimișlia', 'Criuleni', 'Dondușeni', 'Drochia', 'Dubăsari', 'Edineț', 'Fălești', 'Florești', 'Gagauzia', 'Glodeni', 'Hîncești', 'Ialoveni', 'Leova', 'Nisporeni', 'Ocnița', 'Orhei', 'Rezina', 'Rîșcani', 'Sîngerei', 'Șoldănești', 'Ștefan Vodă', 'Strășeni', 'Taraclia', 'Telenești', 'Transnistria', 'Ungheni'],
    'Georgia': ['Adjara', 'Guria', 'Imereti', 'Kakheti', 'Kvemo Kartli', 'Mtskheta-Mtianeti', 'Racha-Lechkhumi and Kvemo Svaneti', 'Samegrelo-Zemo Svaneti', 'Samtskhe-Javakheti', 'Shida Kartli', 'Tbilisi'],
    'Armenia': ['Aragatsotn', 'Ararat', 'Armavir', 'Gegharkunik', 'Kotayk', 'Lori', 'Shirak', 'Syunik', 'Tavush', 'Vayots Dzor', 'Yerevan'],
    'Azerbaijan': ['Absheron', 'Agdam', 'Agdash', 'Aghjabadi', 'Agstafa', 'Agsu', 'Astara', 'Babek', 'Baku', 'Balakan', 'Barda', 'Beylagan', 'Bilasuvar', 'Dashkasan', 'Fuzuli', 'Gadabay', 'Ganja', 'Gobustan', 'Goranboy', 'Goychay', 'Goygol', 'Hajigabul', 'Imishli', 'Ismayilli', 'Jabrayil', 'Jalilabad', 'Julfa', 'Kalbajar', 'Kangarli', 'Khachmaz', 'Khizi', 'Khojali', 'Kurdamir', 'Lachin', 'Lankaran', 'Lerik', 'Masally', 'Mingachevir', 'Naftalan', 'Nakhchivan', 'Neftchala', 'Oghuz', 'Ordubad', 'Qabala', 'Qakh', 'Qazakh', 'Quba', 'Qubadli', 'Qusar', 'Saatly', 'Sabirabad', 'Sadarak', 'Salyan', 'Samukh', 'Shabran', 'Shahbuz', 'Shaki', 'Shamakhi', 'Shamkir', 'Sharur', 'Shirvan', 'Siazan', 'Sumqayit', 'Tartar', 'Tovuz', 'Ujar', 'Yardimli', 'Yevlakh', 'Zangilan', 'Zaqatala', 'Zardab'],
    'Kazakhstan': ['Akmola', 'Aktobe', 'Almaty', 'Almaty City', 'Atyrau', 'Baikonur', 'East Kazakhstan', 'Jambyl', 'Karaganda', 'Kostanay', 'Kyzylorda', 'Mangystau', 'North Kazakhstan', 'Nur-Sultan', 'Pavlodar', 'Turkestan', 'West Kazakhstan'],
    'Uzbekistan': ['Andijan', 'Bukhara', 'Fergana', 'Jizzakh', 'Karakalpakstan', 'Kashkadarya', 'Khorezm', 'Namangan', 'Navoiy', 'Samarkand', 'Sirdaryo', 'Surkhandarya', 'Tashkent', 'Tashkent City'],
    'Kyrgyzstan': ['Batken', 'Bishkek', 'Chuy', 'Issyk-Kul', 'Jalal-Abad', 'Naryn', 'Osh', 'Osh City', 'Talas'],
    'Tajikistan': ['Dushanbe', 'Gorno-Badakhshan', 'Khatlon', 'Sughd'],
    'Turkmenistan': ['Ahal', 'Ashgabat', 'Balkan', 'Dashoguz', 'Lebap', 'Mary'],
    'Mongolia': ['Arkhangai', 'Bayan-Ölgii', 'Bayankhongor', 'Bulgan', 'Darkhan-Uul', 'Dornod', 'Dornogovi', 'Dundgovi', 'Govi-Altai', 'Govisümber', 'Khentii', 'Khovd', 'Khövsgöl', 'Ömnögovi', 'Övörkhangai', 'Orkhon', 'Selenge', 'Sükhbaatar', 'Töv', 'Ulaanbaatar', 'Uvs', 'Zavkhan'],
    'North Korea': ['Chagang', 'North Hamgyong', 'South Hamgyong', 'North Hwanghae', 'South Hwanghae', 'Kangwon', 'North Pyongan', 'South Pyongan', 'Pyongyang', 'Ryanggang'],
    'Taiwan': ['Changhua', 'Chiayi', 'Chiayi City', 'Hsinchu', 'Hsinchu City', 'Hualien', 'Kaohsiung', 'Keelung', 'Kinmen', 'Lienchiang', 'Miaoli', 'Nantou', 'New Taipei', 'Penghu', 'Pingtung', 'Taichung', 'Tainan', 'Taipei', 'Taitung', 'Taoyuan', 'Yilan', 'Yunlin'],
    'Hong Kong': ['Central and Western', 'Eastern', 'Islands', 'Kowloon City', 'Kwai Tsing', 'Kwun Tong', 'North', 'Sai Kung', 'Sha Tin', 'Sham Shui Po', 'Southern', 'Tai Po', 'Tsuen Wan', 'Tuen Mun', 'Wan Chai', 'Wong Tai Sin', 'Yau Tsim Mong', 'Yuen Long'],
    'Macau': ['Macau Peninsula', 'Taipa', 'Coloane'],
    'Brunei': ['Belait', 'Brunei-Muara', 'Temburong', 'Tutong'],
    'East Timor': ['Aileu', 'Ainaro', 'Baucau', 'Bobonaro', 'Cova Lima', 'Dili', 'Ermera', 'Lautém', 'Liquiçá', 'Manatuto', 'Manufahi', 'Oecusse', 'Viqueque'],
    'Papua New Guinea': ['Bougainville', 'Central', 'Chimbu', 'East New Britain', 'East Sepik', 'Eastern Highlands', 'Enga', 'Gulf', 'Madang', 'Manus', 'Milne Bay', 'Morobe', 'New Ireland', 'Northern', 'Southern Highlands', 'West New Britain', 'West Sepik', 'Western', 'Western Highlands'],
    'Fiji': ['Ba', 'Bua', 'Cakaudrove', 'Kadavu', 'Lau', 'Lomaiviti', 'Macuata', 'Nadroga-Navosa', 'Naitasiri', 'Namosi', 'Ra', 'Rewa', 'Rotuma', 'Serua', 'Tailevu'],
    'Samoa': ['A\'ana', 'Aiga-i-le-Tai', 'Atua', 'Fa\'asaleleaga', 'Gaga\'emauga', 'Gaga\'ifomauga', 'Palauli', 'Satupa\'itea', 'Tuamasaga', 'Va\'a-o-Fonoti', 'Vaisigano'],
    'Tonga': ['\'Eua', 'Ha\'apai', 'Niuas', 'Tongatapu', 'Vava\'u'],
    'Vanuatu': ['Malampa', 'Penama', 'Sanma', 'Shefa', 'Tafea', 'Torba']
  };

  cities: { [key: string]: string[] } = {
    // United States
    'Alabama': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'],
    'Alaska': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
    'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'],
    'Arkansas': ['Little Rock', 'Fayetteville', 'Fort Smith', 'Jonesboro', 'North Little Rock'],
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose', 'Oakland', 'Fresno', 'Long Beach', 'Anaheim', 'Santa Ana'],
    'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'],
    'Connecticut': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
    'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
    'Florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee', 'St. Petersburg'],
    'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'],
    'Hawaii': ['Honolulu', 'Hilo', 'Kailua', 'Kaneohe', 'Kahului'],
    'Idaho': ['Boise', 'Nampa', 'Meridian', 'Idaho Falls', 'Pocatello'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield'],
    'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
    'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
    'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka'],
    'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
    'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
    'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
    'Maryland': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie'],
    'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing'],
    'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington'],
    'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
    'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence'],
    'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
    'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
    'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
    'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester'],
    'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison'],
    'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'],
    'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
    'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton'],
    'Oregon': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
    'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence'],
    'South Carolina': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant', 'Rock Hill'],
    'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
    'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Murfreesboro'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington'],
    'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
    'Vermont': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland'],
    'Virginia': ['Virginia Beach', 'Norfolk', 'Richmond', 'Chesapeake', 'Newport News'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
    'West Virginia': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling'],
    'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'],
    'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'],
    
    // India
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Raigarh'],
    'Goa': ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar'],
    'Himachal Pradesh': ['Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Kullu'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kannur'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'],
    'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Meerut'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
    'Delhi': ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi'],
    
    // United Kingdom
    'England': ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Leicester'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Barry'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Bangor'],
    
    // Canada
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond'],
    'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'],
    'New Brunswick': ['Saint John', 'Moncton', 'Fredericton', 'Dieppe', 'Miramichi'],
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
    'Saskatchewan': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current'],
    
    // Australia
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Albury', 'Wagga Wagga'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Warrnambool'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Townsville', 'Cairns', 'Toowoomba'],
    'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Geraldton', 'Kalgoorlie'],
    'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Augusta'],
    
    // Germany
    'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Würzburg'],
    'Berlin': ['Berlin'],
    'Hamburg': ['Hamburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg'],
    'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heidelberg'],
    'Lower Saxony': ['Hanover', 'Braunschweig', 'Oldenburg', 'Osnabrück', 'Wolfsburg'],
    
    // France
    'Île-de-France': ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Saint-Étienne', 'Grenoble', 'Villeurbanne', 'Clermont-Ferrand'],
    'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon'],
    'Occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers'],
    
    // Japan
    'Tokyo': ['Tokyo', 'Shibuya', 'Shinjuku', 'Setagaya', 'Suginami'],
    'Osaka': ['Osaka', 'Sakai', 'Higashiosaka', 'Yao', 'Suita'],
    'Kyoto': ['Kyoto', 'Uji', 'Kameoka', 'Muko', 'Nagaokakyo'],
    'Hokkaido': ['Sapporo', 'Hakodate', 'Asahikawa', 'Kushiro', 'Obihiro'],
    'Aichi': ['Nagoya', 'Toyota', 'Okazaki', 'Ichinomiya', 'Kasugai'],
    
    // China
    'Beijing': ['Beijing', 'Chaoyang', 'Haidian', 'Fengtai', 'Shijingshan'],
    'Shanghai': ['Shanghai', 'Pudong', 'Huangpu', 'Xuhui', 'Changning'],
    'Guangdong': ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan'],
    'Jiangsu': ['Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Xuzhou'],
    'Zhejiang': ['Hangzhou', 'Ningbo', 'Wenzhou', 'Jiaxing', 'Huzhou'],
    
    // Brazil
    'São Paulo': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André'],
    'Rio de Janeiro': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
    'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
    'Paraná': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
    
    // Mexico
    'Mexico City': ['Mexico City', 'Iztapalapa', 'Gustavo A. Madero', 'Álvaro Obregón', 'Tlalpan'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta'],
    'Nuevo León': ['Monterrey', 'Guadalupe', 'San Nicolás de los Garza', 'Santa Catarina', 'Apodaca'],
    'Puebla': ['Puebla', 'Cholula', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco'],
    'Yucatán': ['Mérida', 'Valladolid', 'Progreso', 'Tizimín', 'Kanasín'],
    
    // Spain
    'Madrid': ['Madrid', 'Móstoles', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés'],
    'Catalonia': ['Barcelona', 'Badalona', 'Sabadell', 'Terrassa', 'L\'Hospitalet de Llobregat'],
    'Valencia': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana', 'Torrevieja'],
    'Andalusia': ['Seville', 'Málaga', 'Córdoba', 'Granada', 'Almería'],
    
    // Italy
    'Lombardy': ['Milan', 'Bergamo', 'Brescia', 'Monza', 'Como'],
    'Lazio': ['Rome', 'Latina', 'Guidonia Montecelio', 'Fiumicino', 'Tivoli'],
    'Campania': ['Naples', 'Salerno', 'Torre del Greco', 'Pompei', 'Casoria'],
    'Sicily': ['Palermo', 'Catania', 'Messina', 'Syracuse', 'Marsala'],
    'Veneto': ['Venice', 'Verona', 'Padua', 'Vicenza', 'Treviso'],
    
    // Russia
    'Moscow': ['Moscow', 'Zelenograd', 'Troitsk', 'Krasnogorsk', 'Mytishchi'],
    'Saint Petersburg': ['Saint Petersburg', 'Kolpino', 'Kronstadt', 'Pushkin', 'Peterhof'],
    'Novosibirsk': ['Novosibirsk', 'Berdsk', 'Iskitim', 'Kuybyshev', 'Ob'],
    
    // South Korea
    'Seoul': ['Seoul', 'Gangnam', 'Gangbuk', 'Jongno', 'Seongdong'],
    'Busan': ['Busan', 'Haeundae', 'Sasang', 'Dong', 'Nam'],
    'Gyeonggi': ['Suwon', 'Seongnam', 'Goyang', 'Yongin', 'Bucheon'],
    
    // Indonesia
    'Jakarta': ['Jakarta', 'Central Jakarta', 'North Jakarta', 'South Jakarta', 'East Jakarta'],
    'West Java': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tangerang'],
    'East Java': ['Surabaya', 'Malang', 'Sidoarjo', 'Mojokerto', 'Pasuruan'],
    'Central Java': ['Semarang', 'Surakarta', 'Magelang', 'Pekalongan', 'Tegal'],
    
    // Turkey
    'Istanbul': ['Istanbul', 'Beyoğlu', 'Kadıköy', 'Üsküdar', 'Beşiktaş'],
    'Ankara': ['Ankara', 'Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak'],
    'İzmir': ['İzmir', 'Konak', 'Bornova', 'Karşıyaka', 'Buca'],
    
    // Saudi Arabia
    'Riyadh': ['Riyadh', 'Diriyah', 'Al Kharj', 'Al Majma\'ah', 'Ad Dawadimi'],
    'Makkah': ['Mecca', 'Jeddah', 'Taif', 'Al Qunfudhah', 'Al Lith'],
    'Eastern Province': ['Dammam', 'Khobar', 'Dhahran', 'Jubail', 'Qatif'],
    
    // Argentina
    'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Quilmes'],
    'Córdoba': ['Córdoba', 'Villa María', 'Río Cuarto', 'Villa Carlos Paz', 'San Francisco'],
    'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto', 'Reconquista'],
    
    // South Africa
    'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'East Rand', 'West Rand'],
    'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Mossel Bay'],
    'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Newcastle', 'Pinetown', 'Umlazi'],
    
    // Egypt
    'Cairo': ['Cairo', 'Giza', 'Shubra El Kheima', 'Helwan', '6th of October City'],
    'Alexandria': ['Alexandria', 'Borg El Arab', 'Abu Qir', 'El Montazah', 'El Raml'],
    'Giza': ['Giza', '6th of October', 'Sheikh Zayed', 'Dokki', 'Agouza'],
    
    // Poland
    'Masovia': ['Warsaw', 'Radom', 'Płock', 'Siedlce', 'Pruszków'],
    'Silesia': ['Katowice', 'Częstochowa', 'Sosnowiec', 'Gliwice', 'Zabrze'],
    'Lesser Poland': ['Kraków', 'Tarnów', 'Nowy Sącz', 'Oświęcim', 'Chrzanów'],
    
    // Netherlands
    'North Holland': ['Amsterdam', 'Haarlem', 'Zaandam', 'Hilversum', 'Alkmaar'],
    'South Holland': ['Rotterdam', 'The Hague', 'Leiden', 'Dordrecht', 'Delft'],
    'Utrecht': ['Utrecht', 'Amersfoort', 'Zeist', 'Nieuwegein', 'Veenendaal'],
    
    // Belgium
    'Brussels': ['Brussels', 'Schaerbeek', 'Anderlecht', 'Molenbeek', 'Ixelles'],
    'Antwerp': ['Antwerp', 'Mechelen', 'Turnhout', 'Lier', 'Geel'],
    'East Flanders': ['Ghent', 'Aalst', 'Sint-Niklaas', 'Dendermonde', 'Lokeren'],
    
    // Sweden
    'Stockholm': ['Stockholm', 'Södertälje', 'Upplands Väsby', 'Huddinge', 'Nacka'],
    'Västra Götaland': ['Gothenburg', 'Borås', 'Trollhättan', 'Skövde', 'Uddevalla'],
    'Skåne': ['Malmö', 'Lund', 'Helsingborg', 'Kristianstad', 'Landskrona'],
    
    // Switzerland
    'Zürich': ['Zurich', 'Winterthur', 'Uster', 'Dübendorf', 'Dietikon'],
    'Bern': ['Bern', 'Biel', 'Thun', 'Köniz', 'Steffisburg'],
    'Geneva': ['Geneva', 'Vernier', 'Lancy', 'Meyrin', 'Carouge'],
    
    // Austria
    'Vienna': ['Vienna', 'Floridsdorf', 'Donaustadt', 'Favoriten', 'Leopoldstadt'],
    'Styria': ['Graz', 'Leoben', 'Kapfenberg', 'Bruck an der Mur', 'Feldbach'],
    'Upper Austria': ['Linz', 'Wels', 'Steyr', 'Leonding', 'Traun'],
    
    // Norway
    'Oslo': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Bærum'],
    
    // Denmark
    'Capital Region': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'],
    
    // Finland
    'Uusimaa': ['Helsinki', 'Espoo', 'Vantaa', 'Tampere', 'Oulu'],
    
    // Portugal
    'Lisbon': ['Lisbon', 'Sintra', 'Cascais', 'Amadora', 'Almada'],
    'Porto': ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar', 'Valongo'],
    
    // Greece
    'Attica': ['Athens', 'Piraeus', 'Peristeri', 'Kallithea', 'Acharnes'],
    
    // Ireland
    'Leinster': ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'],
    
    // New Zealand
    'Auckland': ['Auckland', 'Manukau', 'North Shore', 'Waitakere', 'Hamilton'],
    
    // Singapore
    'Central Region': ['Singapore', 'Orchard', 'Marina Bay', 'Raffles Place', 'Clarke Quay'],
    
    // Malaysia
    'Selangor': ['Kuala Lumpur', 'Shah Alam', 'Petaling Jaya', 'Subang Jaya', 'Klang'],
    'Penang': ['George Town', 'Butterworth', 'Bayan Lepas', 'Seberang Perai', 'Bukit Mertajam'],
    
    // Thailand
    'Bangkok': ['Bangkok', 'Thonburi', 'Dusit', 'Ratchathewi', 'Pathum Wan'],
    'Chiang Mai': ['Chiang Mai', 'Mae Rim', 'San Kamphaeng', 'Hang Dong', 'Sansai'],
    
    // Philippines
    'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'],
    'Cebu': ['Cebu City', 'Lapu-Lapu', 'Mandaue', 'Talisay', 'Toledo'],
    
    // Vietnam
    'Hồ Chí Minh City': ['Ho Chi Minh City', 'District 1', 'District 3', 'Binh Thanh', 'Tan Binh'],
    'Hà Nội': ['Hanoi', 'Hoan Kiem', 'Ba Dinh', 'Dong Da', 'Hai Ba Trung'],
    
    // Bangladesh
    'Dhaka': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'],
    
    // Pakistan
    'Pakistan-Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah'],
    
    // Sri Lanka
    'Western': ['Colombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Negombo', 'Kandy'],
    
    // Nepal
    'Bagmati': ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kirtipur', 'Madhyapur Thimi'],
    
    // Myanmar
    'Yangon': ['Yangon', 'Mandalay', 'Naypyidaw', 'Mawlamyine', 'Bago'],
    'Mandalay': ['Mandalay', 'Meiktila', 'Pyin Oo Lwin', 'Mogok', 'Kyaukse'],
    'Ayeyarwady': ['Pathein', 'Hinthada', 'Myaungmya', 'Maubin', 'Pyapon'],
    
    // Cambodia
    'Phnom Penh': ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kampong Cham'],
    
    // Laos
    'Vientiane Capital': ['Vientiane', 'Pakse', 'Savannakhet', 'Luang Prabang', 'Thakhek'],
    
    // Afghanistan
    'Kabul': ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad'],
    
    // Iran
    'Tehran': ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Tabriz'],
    
    // Iraq
    'Baghdad': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf'],
    
    // Israel
    'Tel Aviv': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Rishon LeZion', 'Petah Tikva'],
    
    // United Arab Emirates
    'Dubai': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman'],
    
    // Qatar
    'Ad Dawhah': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Umm Salal'],
    
    // Kuwait
    'Capital': ['Kuwait City', 'Al Ahmadi', 'Hawalli', 'Farwaniya', 'Jahra'],
    
    // Oman
    'Muscat': ['Muscat', 'Salalah', 'Sohar', 'Seeb', 'Barka'],
    
    // Jordan
    'Amman': ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Madaba'],
    
    // Lebanon
    'Beirut': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Byblos'],
    
    // Syria
    'Damascus': ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama'],
    
    // Yemen
    'Sana\'a': ['Sana\'a', 'Aden', 'Taiz', 'Hodeidah', 'Ibb'],
    
    // Chile
    'Metropolitana de Santiago': ['Santiago', 'Puente Alto', 'Maipú', 'La Florida', 'San Bernardo'],
    
    // Colombia
    'Cundinamarca': ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro'],
    
    // Peru
    'Lima': ['Lima', 'Callao', 'Arequipa', 'Trujillo', 'Chiclayo'],
    
    // Venezuela
    'Distrito Capital': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Ciudad Guayana'],
    
    // Ecuador
    'Pichincha': ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala'],
    
    // Uruguay
    'Montevideo': ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandú', 'Las Piedras'],
    
    // Paraguay
    'Asunción': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá'],
    
    // Bolivia
    'La Paz': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Oruro'],
    
    // Cuba
    'Havana': ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Santa Clara'],
    
    // Jamaica
    'Kingston': ['Kingston', 'Montego Bay', 'Spanish Town', 'Portmore', 'Mandeville'],
    
    // Haiti
    'Ouest': ['Port-au-Prince', 'Carrefour', 'Delmas', 'Pétion-Ville', 'Gonaïves'],
    
    // Dominican Republic
    'Distrito Nacional': ['Santo Domingo', 'Santiago', 'La Vega', 'San Cristóbal', 'San Pedro de Macorís'],
    
    // Puerto Rico
    'San Juan': ['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas'],
    
    // Panama
    'Panamá': ['Panama City', 'San Miguelito', 'Tocumen', 'David', 'Colón'],
    
    // Costa Rica
    'San José': ['San José', 'Cartago', 'Alajuela', 'Heredia', 'Liberia'],
    
    // Guatemala
    'Guatemala': ['Guatemala City', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla'],
    
    // Honduras
    'Francisco Morazán': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso'],
    
    // El Salvador
    'San Salvador': ['San Salvador', 'Santa Ana', 'Soyapango', 'San Miguel', 'Mejicanos'],
    
    // Nicaragua
    'Managua': ['Managua', 'León', 'Masaya', 'Chinandega', 'Granada'],
    
    // Belize
    'Belize': ['Belize City', 'San Ignacio', 'Orange Walk', 'Belmopan', 'Dangriga'],
    
    // Trinidad and Tobago
    'San Juan-Laventille': ['Port of Spain', 'San Fernando', 'Chaguanas', 'Arima', 'Couva'],
    
    // Nigeria
    'Lagos': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt'],
    
    // Kenya
    'Nairobi': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
    
    // Ethiopia
    'Addis Ababa': ['Addis Ababa', 'Dire Dawa', 'Mekele', 'Gondar', 'Awassa'],
    
    // Ghana
    'Greater Accra': ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Ashaiman'],
    
    // Tanzania
    'Dar es Salaam': ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya'],
    
    // Uganda
    'Kampala': ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja'],
    
    // Morocco
    'Casablanca-Settat': ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Tangier'],
    
    // Algeria
    'Algiers': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida'],
    
    // Tunisia
    'Tunis': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte'],
    
    // Libya
    'Tripoli': ['Tripoli', 'Benghazi', 'Misrata', 'Bayda', 'Zawiya'],
    
    // Sudan
    'Khartoum': ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'El Geneina'],
    
    // Angola
    'Luanda': ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango'],
    
    // Mozambique
    'Maputo': ['Maputo', 'Matola', 'Beira', 'Nampula', 'Chimoio'],
    
    // Zimbabwe
    'Harare': ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru'],
    
    // Zambia
    'Lusaka': ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola'],
    
    // Botswana
    'South East': ['Gaborone', 'Francistown', 'Molepolole', 'Serowe', 'Maun'],
    
    // Namibia
    'Khomas': ['Windhoek', 'Swakopmund', 'Walvis Bay', 'Oshakati', 'Rundu'],
    
    // Senegal
    'Dakar': ['Dakar', 'Thiès', 'Rufisque', 'Kaolack', 'Ziguinchor'],
    
    // Ivory Coast
    'Lagunes': ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro'],
    
    // Cameroon
    'Centre': ['Yaoundé', 'Douala', 'Garoua', 'Bafoussam', 'Bamenda'],
    
    // Ukraine
    'Kiev': ['Kyiv', 'Kharkiv', 'Odessa', 'Dnipro', 'Donetsk'],
    
    // Romania
    'Bucharest': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța'],
    
    // Czech Republic
    'Prague': ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec'],
    
    // Hungary
    'Budapest': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs'],
    
    // Bulgaria
    'Sofia': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse'],
    
    // Croatia
    'Zagreb': ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'],
    
    // Serbia
    'Belgrade': ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica'],
    
    // Slovakia
    'Bratislava': ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Banská Bystrica'],
    
    // Slovenia
    'Central Slovenia': ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje'],
    
    // Lithuania
    'Vilnius': ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'],
    
    // Latvia
    'Riga': ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala'],
    
    // Estonia
    'Harju': ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve'],
    
    // Belarus
    'Minsk': ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Grodno'],
    
    // Moldova
    'Chișinău': ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița'],
    
    // Georgia
    'Tbilisi': ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Gori'],
    
    // Armenia
    'Yerevan': ['Yerevan', 'Gyumri', 'Vanadzor', 'Vagharshapat', 'Hrazdan'],
    
    // Azerbaijan
    'Baku': ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Lankaran'],
    
    // Kazakhstan
    'Almaty': ['Almaty', 'Nur-Sultan', 'Shymkent', 'Karaganda', 'Aktobe'],
    
    // Uzbekistan
    'Tashkent': ['Tashkent', 'Samarkand', 'Namangan', 'Andijan', 'Bukhara'],
    
    // Kyrgyzstan
    'Bishkek': ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok'],
    
    // Tajikistan
    'Dushanbe': ['Dushanbe', 'Khujand', 'Kulob', 'Qurghonteppa', 'Istaravshan'],
    
    // Turkmenistan
    'Ashgabat': ['Ashgabat', 'Türkmenabat', 'Daşoguz', 'Mary', 'Balkanabat'],
    
    // Mongolia
    'Ulaanbaatar': ['Ulaanbaatar', 'Erdenet', 'Darkhan', 'Choibalsan', 'Mörön'],
    
    // North Korea
    'Pyongyang': ['Pyongyang', 'Hamhung', 'Chongjin', 'Nampo', 'Wonsan'],
    
    // Taiwan
    'Taipei': ['Taipei', 'New Taipei', 'Kaohsiung', 'Taichung', 'Tainan'],
    
    // Hong Kong
    'Central and Western': ['Central', 'Sheung Wan', 'Sai Ying Pun', 'Kennedy Town', 'Mid-Levels'],
    
    // Macau
    'Macau Peninsula': ['Macau', 'Taipa', 'Coloane', 'Cotai'],
    
    // Brunei
    'Brunei-Muara': ['Bandar Seri Begawan', 'Kuala Belait', 'Seria', 'Tutong', 'Bangar'],
    
    // East Timor
    'Dili': ['Dili', 'Baucau', 'Maliana', 'Suai', 'Liquiçá'],
    
    // Papua New Guinea
    'National Capital District': ['Port Moresby', 'Lae', 'Arawa', 'Mount Hagen', 'Popondetta'],
    
    // Fiji
    'Rewa': ['Suva', 'Lautoka', 'Nadi', 'Labasa', 'Ba'],
    
    // Samoa
    'Tuamasaga': ['Apia', 'Vaitele', 'Faleula', 'Leulumoega', 'Vailoa'],
    
    // Tonga
    'Tongatapu': ['Nuku\'alofa', 'Neiafu', 'Pangai', 'Haveluloto', 'Vaini'],
    
    // Vanuatu
    'Shefa': ['Port Vila', 'Luganville', 'Norsup', 'Sola', 'Lakatoro']
  };

  availableStates: string[] = [];
  availableCities: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private signupService: SignupService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.email], [this.emailExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)], [this.phoneNumberExistsValidator()]],
      gender: ['', Validators.required],
      dob: ['', [Validators.required, this.dateValidator]],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10)]],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]]
    });

    // Watch for country changes
    this.signupForm.get('country')?.valueChanges.subscribe(country => {
      this.onCountryChange(country);
    });

    // Watch for state changes
    this.signupForm.get('state')?.valueChanges.subscribe(state => {
      this.onStateChange(state);
    });

    // Watch for email changes to reset availability status
    this.signupForm.get('email')?.valueChanges.subscribe(() => {
      // Reset status when email value changes
      this.emailAvailable = null;
      this.emailChecking = false;
    });

    // Watch for email validation status changes
    this.signupForm.get('email')?.statusChanges.subscribe(status => {
      const emailControl = this.signupForm.get('email');
      
      if (status === 'PENDING') {
        // Async validation in progress
        this.emailChecking = true;
        this.emailAvailable = null;
      } else if (status === 'VALID') {
        // Validation passed - check if it's because email doesn't exist
        this.emailChecking = false;
        if (emailControl && !emailControl.errors?.['emailExists'] && emailControl.value) {
          this.emailAvailable = true;
        }
      } else if (status === 'INVALID') {
        // Validation failed
        this.emailChecking = false;
        if (emailControl?.errors?.['emailExists']) {
          // Email exists error
          this.emailAvailable = false;
        } else {
          // Other validation errors (format, required, etc.)
          this.emailAvailable = null;
        }
      }
    });

    // Watch for phone number changes to reset availability status
    this.signupForm.get('phoneNumber')?.valueChanges.subscribe(() => {
      // Reset status when phone number value changes
      this.phoneNumberAvailable = null;
      this.phoneNumberChecking = false;
    });

    // Watch for phone number validation status changes
    this.signupForm.get('phoneNumber')?.statusChanges.subscribe(status => {
      const phoneNumberControl = this.signupForm.get('phoneNumber');
      
      if (status === 'PENDING') {
        // Async validation in progress
        this.phoneNumberChecking = true;
        this.phoneNumberAvailable = null;
      } else if (status === 'VALID') {
        // Validation passed - check if it's because phone number doesn't exist
        this.phoneNumberChecking = false;
        if (phoneNumberControl && !phoneNumberControl.errors?.['phoneNumberExists'] && phoneNumberControl.value) {
          this.phoneNumberAvailable = true;
        }
      } else if (status === 'INVALID') {
        // Validation failed
        this.phoneNumberChecking = false;
        if (phoneNumberControl?.errors?.['phoneNumberExists']) {
          // Phone number exists error
          this.phoneNumberAvailable = false;
        } else {
          // Other validation errors (format, required, etc.)
          this.phoneNumberAvailable = null;
        }
      }
    });
  }

  onCountryChange(country: string): void {
    this.availableStates = this.states[country] || [];
    this.signupForm.patchValue({ state: '', city: '' });
    this.availableCities = [];
  }

  onStateChange(state: string): void {
    const country = this.signupForm.get('country')?.value;
    const stateKey = `${country}-${state}`;
    // Try composite key first (for cases like Pakistan-Punjab), then fallback to state name
    this.availableCities = this.cities[stateKey] || this.cities[state] || [];
    this.signupForm.patchValue({ city: '' });
  }

  dateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    
    if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
      return { invalidAge: true };
    }
    
    if (selectedDate > today) {
      return { futureDate: true };
    }
    
    return null;
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Don't check if email is empty
      if (!control.value || control.value.trim() === '') {
        return of(null);
      }

      // Check if email format is invalid (sync validators should have run first)
      // But we'll also validate format here as a safety check
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(control.value)) {
        console.log('Email format invalid, skipping existence check');
        return of(null);
      }

      // Add a small delay to debounce rapid typing
      return timer(800).pipe(
        switchMap(() => {
          // Double-check email is still valid and not empty
          if (!control.value || !emailPattern.test(control.value)) {
            return of(null);
          }

          console.log('🔍 Checking email existence for:', control.value);

          return this.signupService.checkEmailExists(control.value).pipe(
            map((response: any) => {
              console.log('=== Email Check API Response ===');
              console.log('Full response:', response);
              console.log('Response type:', typeof response);
              console.log('Response value:', response);
              
              // Handle plain text response (backend returns "Email exists in the database." as text)
              let responseText = '';
              if (typeof response === 'string') {
                responseText = response;
                console.log('Response is plain text:', responseText);
              } else if (response?.text) {
                responseText = response.text;
                console.log('Response text from object:', responseText);
              }
              
              // Check if response text indicates email exists
              if (responseText) {
                const lowerText = responseText.toLowerCase();
                if (lowerText.includes('email exists') || 
                    lowerText.includes('exists in the database') ||
                    lowerText.includes('already exists') ||
                    lowerText.includes('already registered')) {
                  console.log('✅ Email exists (detected from plain text: "' + responseText + '")');
                  return { emailExists: true };
                }
                // If text says email is available
                if (lowerText.includes('email available') || 
                    lowerText.includes('email does not exist') ||
                    lowerText.includes('not found') ||
                    lowerText.includes('available')) {
                  console.log('✅ Email is available (detected from plain text: "' + responseText + '")');
                  return null;
                }
              }
              
              // Handle different possible API response structures
              // Check if response indicates email exists
              let emailExists = false;
              
              // Direct boolean or string (true means exists)
              if (response === true || response === 'true' || response === 'TRUE') {
                emailExists = true;
                console.log('Email exists: Direct boolean/string true');
              }
              // Direct boolean false (email doesn't exist - this is fine, continue)
              else if (response === false || response === 'false' || response === 'FALSE') {
                emailExists = false;
                console.log('Email available: Direct boolean/string false');
              }
              // Object with exists property
              else if (response?.exists === true || 
                       response?.emailExists === true || 
                       response?.isExists === true ||
                       response?.emailAlreadyExists === true ||
                       response?.exists === 'true' ||
                       response?.emailExists === 'true') {
                emailExists = true;
                console.log('Email exists: Object property (exists/emailExists/isExists)');
              }
              // Object with exists = false (email available)
              else if (response?.exists === false || 
                       response?.emailExists === false ||
                       response?.exists === 'false') {
                emailExists = false;
                console.log('Email available: Object property false');
              }
              // Status field
              else if (response?.status === 'exists' || 
                       response?.status === 'EXISTS' ||
                       response?.status === 'already_exists' ||
                       response?.status === 'ALREADY_EXISTS') {
                emailExists = true;
                console.log('Email exists: Status field');
              }
              // Available field (false means exists, true means available)
              else if (response?.available === false || 
                       response?.isAvailable === false ||
                       response?.available === 'false' ||
                       response?.available === 'FALSE') {
                emailExists = true;
                console.log('Email exists: Available field is false');
              }
              // Available = true means email is available
              else if (response?.available === true || 
                       response?.isAvailable === true ||
                       response?.available === 'true') {
                emailExists = false;
                console.log('Email available: Available field is true');
              }
              // Nested data object
              else if (response?.data?.exists === true || 
                       response?.data?.emailExists === true ||
                       response?.result?.exists === true ||
                       response?.body?.exists === true) {
                emailExists = true;
                console.log('Email exists: Nested data object');
              }
              // Check all string/number properties for common patterns
              else if (typeof response === 'object' && response !== null) {
                // Check all properties for existence indicators
                const responseStr = JSON.stringify(response).toLowerCase();
                if (responseStr.includes('"exists":true') || 
                    responseStr.includes('"emailexists":true') ||
                    responseStr.includes('"alreadyexists":true')) {
                  emailExists = true;
                  console.log('Email exists: Found in stringified response');
                }
              }
              
              // Check message strings
              const message = response?.message || 
                             response?.msg || 
                             response?.data?.message || 
                             response?.error?.message || '';
              if (message && typeof message === 'string') {
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('exists') || 
                    lowerMessage.includes('already') || 
                    lowerMessage.includes('taken') ||
                    lowerMessage.includes('registered') ||
                    lowerMessage.includes('found') ||
                    lowerMessage.includes('duplicate')) {
                  emailExists = true;
                  console.log('Email exists: Message indicates exists');
                }
              }
              
              console.log('Final email exists result:', emailExists);
              
              if (emailExists) {
                console.log('❌ Email already exists - returning validation error');
                return { emailExists: true };
              }
              
              console.log('✅ Email is available');
              return null;
            }),
            catchError((error) => {
              console.log('❌ Email check API error:', error);
              console.log('Error status:', error.status);
              console.log('Error body:', error.error);
              console.log('Full error object:', JSON.stringify(error, null, 2));
              
              // Handle the case where backend returns plain text instead of JSON
              // This happens when backend returns "Email exists in the database." as plain text
              if (error.status === 200) {
                // Check if error.error contains text indicating email exists
                const errorText = error.error?.text || 
                                 error.error?.error?.text || 
                                 (typeof error.error === 'string' ? error.error : '') ||
                                 '';
                
                console.log('Error text found:', errorText);
                
                if (errorText) {
                  const lowerText = errorText.toLowerCase();
                  if (lowerText.includes('email exists') || 
                      lowerText.includes('exists in the database') ||
                      lowerText.includes('already exists') ||
                      lowerText.includes('already registered') ||
                      lowerText.includes('email is taken')) {
                    console.log('✅ Email exists (detected from plain text response)');
                    return of({ emailExists: true });
                  }
                  // If text says email doesn't exist or is available
                  if (lowerText.includes('email available') || 
                      lowerText.includes('email does not exist') ||
                      lowerText.includes('not found')) {
                    console.log('✅ Email is available (detected from plain text response)');
                    return of(null);
                  }
                }
                
                // Also check error.error object structure
                if (error.error) {
                  const emailExists = 
                    error.error === true ||
                    error.error?.exists === true ||
                    error.error?.emailExists === true ||
                    error.error?.status === 'exists' ||
                    (error.error?.message && typeof error.error.message === 'string' && (
                      error.error.message.toLowerCase().includes('exists') ||
                      error.error.message.toLowerCase().includes('already') ||
                      error.error.message.toLowerCase().includes('taken')
                    ));
                  if (emailExists) {
                    console.log('✅ Email exists (from error.error object)');
                    return of({ emailExists: true });
                  }
                }
              }
              
              // If API returns 409 Conflict, email likely exists
              if (error.status === 409) {
                console.log('✅ Email exists (409 Conflict)');
                return of({ emailExists: true });
              }
              
              // For other errors (network, 500, etc.), don't block the form
              // Return null to allow form submission (backend will validate on submit)
              console.warn('⚠️ Error checking email existence - allowing form submission:', error);
              return of(null);
            })
          );
        })
      );
    };
  }

  phoneNumberExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Don't check if phone number is empty
      if (!control.value || control.value.trim() === '') {
        return of(null);
      }

      // Check if phone number format is invalid (sync validators should have run first)
      const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phonePattern.test(control.value)) {
        console.log('Phone number format invalid, skipping existence check');
        return of(null);
      }

      // Add a small delay to debounce rapid typing
      return timer(800).pipe(
        switchMap(() => {
          // Double-check phone number is still valid and not empty
          if (!control.value || !phonePattern.test(control.value)) {
            return of(null);
          }

          console.log('🔍 Checking phone number existence for:', control.value);

          return this.signupService.checkPhoneNumberExists(control.value).pipe(
            map((response: any) => {
              console.log('=== Phone Number Check API Response ===');
              console.log('Full response:', response);
              console.log('Response type:', typeof response);
              console.log('Response value:', response);
              
              // Handle plain text response (backend returns "Phone number exists in the database." as text)
              let responseText = '';
              if (typeof response === 'string') {
                responseText = response;
                console.log('Response is plain text:', responseText);
              } else if (response?.text) {
                responseText = response.text;
                console.log('Response text from object:', responseText);
              }
              
              // Check if response text indicates phone number exists
              if (responseText) {
                const lowerText = responseText.toLowerCase();
                if (lowerText.includes('phone number exists') || 
                    lowerText.includes('phone exists') ||
                    lowerText.includes('exists in the database') ||
                    lowerText.includes('already exists') ||
                    lowerText.includes('already registered') ||
                    lowerText.includes('phone number is taken')) {
                  console.log('✅ Phone number exists (detected from plain text: "' + responseText + '")');
                  return { phoneNumberExists: true };
                }
                // If text says phone number is available
                if (lowerText.includes('phone number available') || 
                    lowerText.includes('phone number does not exist') ||
                    lowerText.includes('not found') ||
                    lowerText.includes('available')) {
                  console.log('✅ Phone number is available (detected from plain text: "' + responseText + '")');
                  return null;
                }
              }
              
              // Handle different possible API response structures
              // Check if response indicates phone number exists
              let phoneNumberExists = false;
              
              // Direct boolean or string (true means exists)
              if (response === true || response === 'true' || response === 'TRUE') {
                phoneNumberExists = true;
                console.log('Phone number exists: Direct boolean/string true');
              }
              // Object with exists property
              else if (response?.exists === true || 
                       response?.phoneNumberExists === true || 
                       response?.isExists === true ||
                       response?.phoneNumberAlreadyExists === true ||
                       response?.exists === 'true' ||
                       response?.phoneNumberExists === 'true') {
                phoneNumberExists = true;
                console.log('Phone number exists: Object property');
              }
              // Status field
              else if (response?.status === 'exists' || 
                       response?.status === 'EXISTS' ||
                       response?.status === 'already_exists') {
                phoneNumberExists = true;
                console.log('Phone number exists: Status field');
              }
              // Available field (false means exists)
              else if (response?.available === false || 
                       response?.isAvailable === false ||
                       response?.available === 'false' ||
                       response?.available === 'FALSE') {
                phoneNumberExists = true;
                console.log('Phone number exists: Available field is false');
              }
              
              // Check message strings
              const message = response?.message || 
                             response?.msg || 
                             response?.data?.message || 
                             response?.error?.message || '';
              if (message && typeof message === 'string') {
                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('exists') || 
                    lowerMessage.includes('already') || 
                    lowerMessage.includes('taken') ||
                    lowerMessage.includes('registered') ||
                    lowerMessage.includes('found') ||
                    lowerMessage.includes('duplicate')) {
                  phoneNumberExists = true;
                  console.log('Phone number exists: Message indicates exists');
                }
              }
              
              console.log('Final phone number exists result:', phoneNumberExists);
              
              if (phoneNumberExists) {
                console.log('❌ Phone number already exists - returning validation error');
                return { phoneNumberExists: true };
              }
              
              console.log('✅ Phone number is available');
              return null;
            }),
            catchError((error) => {
              console.log('❌ Phone number check API error:', error);
              console.log('Error status:', error.status);
              console.log('Error body:', error.error);
              console.log('Full error object:', JSON.stringify(error, null, 2));
              
              // Handle the case where backend returns plain text instead of JSON
              if (error.status === 200) {
                // Check if error.error contains text indicating phone number exists
                const errorText = error.error?.text || 
                                 error.error?.error?.text || 
                                 (typeof error.error === 'string' ? error.error : '') ||
                                 '';
                
                console.log('Error text found:', errorText);
                
                if (errorText) {
                  const lowerText = errorText.toLowerCase();
                  if (lowerText.includes('phone number exists') || 
                      lowerText.includes('phone exists') ||
                      lowerText.includes('exists in the database') ||
                      lowerText.includes('already exists') ||
                      lowerText.includes('already registered') ||
                      lowerText.includes('phone number is taken')) {
                    console.log('✅ Phone number exists (detected from plain text response)');
                    return of({ phoneNumberExists: true });
                  }
                  // If text says phone number doesn't exist or is available
                  if (lowerText.includes('phone number available') || 
                      lowerText.includes('phone number does not exist') ||
                      lowerText.includes('not found')) {
                    console.log('✅ Phone number is available (detected from plain text response)');
                    return of(null);
                  }
                }
                
                // Also check error.error object structure
                if (error.error) {
                  const phoneNumberExists = 
                    error.error === true ||
                    error.error?.exists === true ||
                    error.error?.phoneNumberExists === true ||
                    error.error?.status === 'exists' ||
                    (error.error?.message && typeof error.error.message === 'string' && (
                      error.error.message.toLowerCase().includes('exists') ||
                      error.error.message.toLowerCase().includes('already') ||
                      error.error.message.toLowerCase().includes('taken')
                    ));
                  if (phoneNumberExists) {
                    console.log('✅ Phone number exists (from error.error object)');
                    return of({ phoneNumberExists: true });
                  }
                }
              }
              
              // If API returns 409 Conflict, phone number likely exists
              if (error.status === 409) {
                console.log('✅ Phone number exists (409 Conflict)');
                return of({ phoneNumberExists: true });
              }
              
              // For other errors (network, 500, etc.), don't block the form
              // Return null to allow form submission (backend will validate on submit)
              console.warn('⚠️ Error checking phone number existence - allowing form submission:', error);
              return of(null);
            })
          );
        })
      );
    };
  }

  get f() {
    return this.signupForm.controls;
  }

  getFieldError(fieldName: string): string {
    const field = this.f[fieldName];
    if (field?.errors && (field.dirty || field.touched || this.submitted)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['emailExists']) {
        return 'This email is already registered. Please use a different email address.';
      }
      if (field.errors['phoneNumberExists']) {
        return 'This phone number is already registered. Please use a different phone number.';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'password') {
          return 'Password must contain at least one uppercase, one lowercase, one number, and one special character';
        }
        if (fieldName === 'phoneNumber') {
          return 'Please enter a valid phone number';
        }
        if (fieldName === 'pincode') {
          return 'Pincode must be 5-6 digits';
        }
        if (fieldName === 'firstName' || fieldName === 'lastName') {
          return 'Only letters are allowed';
        }
        return 'Invalid format';
      }
      if (field.errors['invalidAge']) {
        return 'You must be at least 13 years old';
      }
      if (field.errors['futureDate']) {
        return 'Date of birth cannot be in the future';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      dob: 'Date of Birth',
      country: 'Country',
      state: 'State',
      city: 'City',
      address: 'Address',
      pincode: 'Pincode'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.signupForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.isLoading = true;
    const formData: SignupData = this.signupForm.value;
    
    console.log('Submitting signup form with data:', formData);
    console.log('API Endpoint: http://localhost:8081/signUp');

    this.signupService.signup(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('API Response received:', response);
        
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(formData));
        
        // Show success message briefly before navigation
        this.successMessage = 'Signup successful! Welcome to Trove Social App.';
        
        // Navigate to homepage after a short delay
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('API Error Details:', error);
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        console.error('Error Body:', error.error);
        
        // Handle different error scenarios
        if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check if the backend is running on http://localhost:8081';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid data. Please check your input.';
        } else if (error.status === 409) {
          this.errorMessage = error.error?.message || 'User already exists with this email.';
        } else if (error.status === 500) {
          this.errorMessage = error.error?.message || 'Server error. Please try again later.';
        } else {
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
        }
      }
    });
  }
}

