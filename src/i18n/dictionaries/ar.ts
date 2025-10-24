import type { Dict } from "../get-dictionary";

export const dict: Dict = {
  landing: {
    title: "احصل على رأي أولي حول إجراءات تسوية وضعيتك",
    tagline:
      "أجب عن بعض الأسئلة. في النهاية ستتلقى ملف PDF يضم الأسس القانونية والخطوات القادمة.",
    start: "ابدأ",
    price_hint: "السعر التقريبي: 39€",
    legal_hint: "هذا ليس استشارة قانونية. سيتم إضافة الإشعارات القانونية وRGPD قريبًا.",
    features: ["مسار بسيط ومجهول", "FR / عربي / EN", "اللجوء + الحياة الخاصة والعائلية أولاً"],
  },
  questions: {
    has_children: { label: "هل لديك أطفال قصّر في فرنسا؟", yes: "نعم", no: "لا" },
    years_in_france: { label: "منذ كم سنة تقيم في فرنسا؟", placeholder: "0" },
    department: { label: "ما هو رقم المقاطعة التي تقيم فيها؟ (مثال: 75، 93)", placeholder: "75" },
    situation: {
      label: "وضعك الرئيسي اليوم",
      asile: "طلب لجوء / حماية",
      vpf: "الحياة الخاصة والعائلية",
      travail: "العمل / موظف",
    },
    has_job_offer: { label: "هل لديك عرض عمل؟", yes: "نعم", no: "لا" },
    years_worked_in_france: {
      label: "منذ كم سنة تعمل في فرنسا (مصرّح)؟",
      placeholder: "0",
    },
    payslips_last_24m: {
      label: "كم عدد كشوف الرواتب لديك خلال آخر 24 شهرًا؟",
      placeholder: "0",
    },
    has_tax_returns: { label: "هل قدّمتَ إقرارات ضريبية في فرنسا؟", yes: "نعم", no: "لا" },
    tension_occupation: {
      label: "هل مهنتك ضمن المهن المطلوبة (قائمة النقص)؟",
      yes: "نعم",
      no: "لا",
    },
    ui: {
      back: "رجوع",
      next: "التالي",
      see_recap: "عرض الملخص",
      step: (n, total) => `السؤال ${n} من ${total}`,
      required: "يرجى الإجابة للمتابعة.",
      init: "يرجى الانتظار، يتم التهيئة…",
    },
  },
  recap: {
    title: "الملخص",
    decision_title: "القرار (نسخة تجريبية v1)",
    pathway_prefix: "المسار المختار: ",
    your_answers: "إجاباتك",
    status_prefix: "حالة الملف: ",
  },
  access: {
    menu_link: "الدخول إلى ملفي",
    title: "الدخول إلى ملفي",
    subtitle:
      "أدخل رمز الوصول المكوّن من 6 أرقام الذي حصلت عليه في صفحة الملخص أو بعد الدفع.",
    input_label: "رمز الوصول",
    input_placeholder: "6 أرقام…",
    submit: "فتح ملفي",
    helper:
      "نصيحة: احتفظ بهذا الرمز. يمكنك من متابعة ملفك لاحقًا على أي جهاز.",
    error_generic: "رمز غير صالح أو ملف غير موجود. يرجى المحاولة مرة أخرى.",
  },
};




