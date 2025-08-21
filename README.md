# 🌱 GreenBorrow - Sustainable Community Sharing Platform

**GreenBorrow** is a full-stack web application that enables neighbors to share tools, appliances, and equipment while tracking their collective environmental impact. Built for the Syrotech MVP Hackathon, it combines community sharing with gamified sustainability challenges.

## 🎯 **Problem Statement**

- Urban households buy tools used for ~13 minutes in their lifetime
- Leads to wasted money, clutter, and unnecessary CO₂ emissions
- Eco-conscious individuals lack engaging platforms to share resources and track impact

## 🚀 **Solution**

GreenBorrow combines a **free lending platform** with **gamified sustainability challenges**:
- **Borrow instead of buy** household tools, appliances, camping gear, and books
- **Gamified climate challenges** to earn eco-points and badges
- **Real-time CO₂ impact tracking** with community leaderboards

## ✨ **Key Features**

### 🏠 **Core Marketplace**
- **Browse Items**: Search, filter, and discover available items by category
- **Request to Borrow**: Submit borrow requests with dates and messages
- **Smart CO₂ Calculator**: Automatic CO₂ impact calculation based on item type
- **Trust System**: User ratings and reviews for community safety

### 📦 **My Items Management**
- **List Items**: Add your items with automated CO₂ impact calculations
- **Manage Requests**: Approve/decline incoming borrow requests
- **Track Lending**: Monitor your items and their usage
- **CRUD Operations**: Full create, read, update, delete functionality

### 🏆 **Gamification System**
- **Challenges**: Join community challenges (Borrow 3 items, Lend 5 items, etc.)
- **Progress Tracking**: Visual progress bars with real-time updates
- **Badges & Points**: Earn rewards for sustainable actions
- **Leaderboards**: Community and neighborhood rankings

### 📊 **Impact Dashboard**
- **CO₂ Savings Visualization**: Charts showing environmental impact by neighborhood
- **Community Stats**: Total items shared, members active, impact metrics
- **Category Analytics**: Breakdown of shared items by type
- **Personal Metrics**: Individual eco-points and achievements

## 🛠 **Tech Stack**

### **Frontend**
- **React 18** with Vite for fast development
- **Chart.js** for beautiful data visualizations
- **Custom CSS** with animations and responsive design
- **React Hot Toast** for user notifications

### **Backend & Database**
- **Supabase** (PostgreSQL) for real-time database
- **Row Level Security (RLS)** for data protection
- **Supabase Auth** for user authentication
- **Supabase Storage** for file uploads

### **Key Libraries**
- `@supabase/supabase-js` - Database and auth client
- `chart.js` + `react-chartjs-2` - Data visualization
- `react-hot-toast` - Notifications
- `lucide-react` - Icons

## 🗂 **Database Schema**

### **Core Tables**
```sql
profiles          - User profiles with ratings and eco-points
items             - Shared items with CO₂ impact data
borrow_requests   - Request management with status tracking
reviews           - User rating and review system
challenges        - Gamification challenges
user_challenges   - User progress on challenges
issue_reports     - Dispute resolution system
```

### **Key Relationships**
- Users → Items (one-to-many)
- Items → Borrow Requests (one-to-many)
- Users → Challenges (many-to-many via user_challenges)
- Borrow Requests → Reviews (one-to-one)

## 🌍 **Smart CO₂ Impact System**

### **Automated Calculation**
```javascript
// Example: Power drill automatically calculated as 12kg CO₂ saved
calculateCO2Savings('Cordless Drill', 'Tools', '18V Makita', 'Good')
// Returns: 12kg based on manufacturing impact data
```

### **Category-Based Estimates**
- **Tools**: 8-15kg (drills, saws, power tools)
- **Appliances**: 6-45kg (mixers, microwaves, pressure washers)
- **Camping Gear**: 4-120kg (tents, bikes, kayaks)
- **Books**: 0.3-2kg (novels, textbooks)
- **Other**: 3-85kg (furniture, electronics, sports equipment)

## 🎮 **Gamification Features**

### **Challenge Types**
1. **Borrow Challenges**: "Borrow 3 items this week" (60 points)
2. **Lending Challenges**: "Share 5 items with community" (100 points)
3. **Sustainability Challenges**: "Go plastic-free for 7 days" (50 points)
4. **Repair Challenges**: "Fix instead of replace" (40 points)

### **Badge System**
- 🏆 **Sharing Champion** - Complete borrow challenges
- 🤝 **Community Helper** - Excel at lending
- ♻️ **Plastic Warrior** - Sustainability focus
- 🔧 **Repair Hero** - Fix instead of replace
- 👶 **First Steps** - Welcome badge

## 📱 **User Experience**

### **Onboarding Flow**
1. **Demo Login** - Instant access with sample data
2. **Browse Items** - Discover available items
3. **Make Requests** - Submit borrow requests
4. **Join Challenges** - Start earning points
5. **Share Items** - List your own items

### **Core User Journey**
```
Browse Items → Request to Borrow → Owner Approves → 
Pick Up Item → Return Item → Leave Review → Earn Points
```

## 🔒 **Security & Trust**

### **Data Protection**
- Row Level Security (RLS) policies
- User authentication via Supabase Auth
- Protected API endpoints
- Input validation and sanitization

### **Community Safety**
- User rating system (5-star reviews)
- Report issue functionality
- Profile verification
- Community moderation tools

## 📊 **Impact Metrics**

### **Environmental Benefits**
- **CO₂ Reduction**: 5kg saved per power tool borrowed
- **Waste Reduction**: Prevents unnecessary purchases
- **Resource Efficiency**: Maximizes item utilization

### **Community Benefits**
- **Social Connection**: Neighbors helping neighbors
- **Cost Savings**: Free borrowing vs. purchasing
- **Space Optimization**: Reduced household clutter

## 🚀 **Deployment**

### **Environment Setup**
```bash
# Install dependencies
npm install

# Environment variables (.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev

# Build for production
npm run build
```

### **Database Setup**
1. Create Supabase project
2. Run provided SQL schema scripts
3. Insert sample data
4. Configure RLS policies

## 📈 **Future Roadmap**

### **Phase 2 Features**
- **Real-time Messaging** between users
- **Photo Upload** for items
- **Map Integration** for location-based discovery
- **Mobile App** (React Native)
- **IoT Integration** for smart lockers

### **Scaling Considerations**
- **Microservices Architecture** for large user bases
- **CDN Integration** for global performance
- **Advanced Analytics** with machine learning
- **Partnership Integration** with local governments

## 🏆 **Hackathon Highlights**

### **Technical Excellence**
- ✅ **Full-stack Implementation** with modern tech stack
- ✅ **Real-time Database** with Supabase
- ✅ **Beautiful UI/UX** with custom CSS and animations
- ✅ **Data Visualization** with interactive charts
- ✅ **Smart Automation** (CO₂ calculations)

### **Business Impact**
- ✅ **Clear Problem-Solution Fit**
- ✅ **Measurable Environmental Impact**
- ✅ **Community Building** focus
- ✅ **Scalable Business Model**
- ✅ **User Engagement** through gamification

### **Demo Flow**
1. **Dashboard**: Show community impact and statistics
2. **Browse Items**: Demonstrate marketplace functionality
3. **Request Flow**: Complete borrow request process
4. **My Items**: Show item management capabilities
5. **Challenges**: Demonstrate gamification system
6. **Impact**: Highlight CO₂ savings and community benefit

## 👥 **Team & Acknowledgments**

**Built by**: [Your Name]  
**Hackathon**: Syrotech MVP Hackathon  
**Timeline**: [Duration]  
**Tech Stack**: React, Supabase, Chart.js, Vite

### **Special Thanks**
- Supabase for the incredible backend platform
- Chart.js for beautiful data visualizations
- The open-source community for amazing tools

## 📄 **License**

MIT License - feel free to use this project as inspiration for your own community sharing platforms!

---

### 🌟 **Experience GreenBorrow**

**Live Demo**: [Your deployment URL]  
**Repository**: [Your GitHub repo]  
**Demo Login**: Use "Demo Login" button for instant access

*Building sustainable communities, one shared item at a time.* 🌱

---

**Note**: This project demonstrates the power of technology to solve real-world environmental and community problems. The combination of practical sharing economy features with engaging gamification creates a platform that users will love while making a positive impact on the planet.