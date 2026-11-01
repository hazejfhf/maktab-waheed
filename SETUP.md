# خطوات التفعيل (مرة واحدة)

1. Firebase Console → Authentication → Sign-in method → فعّل **Email/Password**.
2. Authentication → Users → Add user: إيميل الأدمن (نفس القيمة في `ADMIN_LOGIN_EMAIL` داخل firebase-db.js، الافتراضي admin@officeraheem.app) + كلمة سر قوية.
3. Firestore → أنشئ collection اسمها `admins` وفيها document ID = الـ UID بتاع حساب الأدمن (أي حقول).
4. Firestore → Rules → الصق محتوى `firestore.rules` واضغط Publish.
5. افتح admin.html واكتب كلمة سر الأدمن في الخانة → بعد الدخول: تبويب العجلة → أي تعديل بيتحفظ على السيرفر تلقائياً (config/wheel).
6. الحسابات القديمة: العميل يدخل بنفس رقم الحساب وكلمة السر من نفس الجهاز وهتتنقل تلقائياً لـ Firebase (كلمة السر لازم 6 حروف أو أكتر).

## مهم: لو ظهرت رسالة "خدمة إنشاء الحسابات غير مفعّلة" أو "الخدمة غير جاهزة"
- **Authentication**: Firebase Console → Build → Authentication → اضغط Get started → Sign-in method → فعّل Email/Password.
- **Firestore**: Firebase Console → Build → Firestore Database → Create database (أو فعّل Cloud Firestore API من رابط الخطأ في مشروع office-raheem)، وانتظر دقيقتين ثم جرّب.

## باسورد الأدمن
الأدمن بيدخل بحساب Firebase Auth (مش من الكود). لتغيير الباسورد: Firebase Console → Authentication → Users → حساب الأدمن (admin@officeraheem.app) → ⋮ → Reset password / أو احذفه وأضفه من جديد بالباسورد الجديد، وحافظ إن مستند admins/<UID> يفضل مطابق للـ UID.

## تحديث الأمان (مهم)
- انشر `firestore.rules` الجديد: Firestore → Rules → الصق → Publish.
- الأدمن الكامل: مستند `admins/<UID>` (أي حقول). الأدمن المساعد: أنشئ له حساب Firebase Auth عادي (مش دومين users.officeraheem.app) + مستند `admins/<UID>` فيه حقل `level` = `sub` → يشوف الطلبات والتقييمات فقط، والسيرفر يمنعه من المنتجات والإعدادات والمستخدمين.
- دخول الأدمن المساعد القديم بـ localStorage اتلغى.
- تتبع الطلب بقى من جهاز العميل فقط (قراءة orders بقت للأدمن فقط).
