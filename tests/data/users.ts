// الباسوورد موحّد لكل المستخدمين — يُقرأ من .env أو يستخدم القيمة الافتراضية
const PASSWORD = process.env.STANDARD_PASSWORD ?? 'secret_sauce';

export const users = {
  standard:         { username: process.env.STANDARD_USER ?? 'standard_user',               password: PASSWORD },
  lockedOut:        { username: 'locked_out_user',                                          password: PASSWORD },
  problem:          { username: 'problem_user',                                             password: PASSWORD },
  performanceGlitch:{ username: 'performance_glitch_user',                                  password: PASSWORD },
  error:            { username: 'error_user',                                               password: PASSWORD },
  visual:           { username: 'visual_user',                                              password: PASSWORD },
};

// بيانات العميل المستخدمة في اختبارات الـ Checkout
export const checkoutCustomer = {
  firstName: 'Quality',
  lastName: 'Tester',
  postalCode: '10001',
};
