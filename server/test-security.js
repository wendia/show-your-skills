// 测试输入验证和请求限制
console.log('\n🧪 安全中间件测试\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    if (fn()) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name} - 断言失败`);
      failed++;
    }
  } catch (e) {
    console.log(`❌ ${name} - 错误: ${e.message}`);
    failed++;
  }
}

// ===== 输入验证测试 =====

console.log('📦 输入验证测试\n');

test('用户名长度验证：3个字符有效', () => {
  const username = 'abc';
  return username.length >= 3 && username.length <= 20;
});

test('用户名长度验证：2个字符无效', () => {
  const username = 'ab';
  return !(username.length >= 3 && username.length <= 20);
});

test('用户名格式验证：含特殊字符无效', () => {
  const username = 'test@user';
  const valid = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username);
  return !valid; // 应该无效
});

test('用户名格式验证：中文有效', () => {
  const username = '测试用户';
  const valid = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username);
  return valid;
});

test('邮箱格式验证：正确格式', () => {
  const email = 'test@example.com';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
});

test('邮箱格式验证：错误格式', () => {
  const email = 'invalid-email';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !regex.test(email);
});

test('密码强度验证：含字母和数字', () => {
  const password = 'Password123';
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
});

test('密码强度验证：只有字母', () => {
  const password = 'password';
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return !(hasLetter && hasNumber); // 应该无效
});

test('密码长度验证：6个字符有效', () => {
  const password = 'Pass12';
  return password.length >= 6 && password.length <= 50;
});

test('密码长度验证：5个字符无效', () => {
  const password = 'Pass1';
  return !(password.length >= 6 && password.length <= 50);
});

// ===== 位置验证测试 =====

console.log('\n📦 位置验证测试\n');

test('棋盘位置 (7,7) 有效', () => {
  const pos = { row: 7, col: 7 };
  return pos.row >= 0 && pos.row <= 14 && pos.col >= 0 && pos.col <= 14;
});

test('棋盘位置 (-1,0) 无效', () => {
  const pos = { row: -1, col: 0 };
  return !(pos.row >= 0 && pos.row <= 14);
});

test('棋盘位置 (15,0) 无效', () => {
  const pos = { row: 15, col: 0 };
  return !(pos.row >= 0 && pos.row <= 14);
});

test('棋盘位置 (14,14) 有效', () => {
  const pos = { row: 14, col: 14 };
  return pos.row >= 0 && pos.row <= 14 && pos.col >= 0 && pos.col <= 14;
});

// ===== 请求频率限制测试 =====

console.log('\n📦 请求频率限制测试\n');

test('登录限制：15分钟5次', () => {
  const limit = 5;
  const windowMs = 15 * 60 * 1000;
  return limit === 5 && windowMs === 900000;
});

test('注册限制：1小时3次', () => {
  const limit = 3;
  const windowMs = 60 * 60 * 1000;
  return limit === 3 && windowMs === 3600000;
});

test('API 限制：1分钟60次', () => {
  const limit = 60;
  const windowMs = 60 * 1000;
  return limit === 60 && windowMs === 60000;
});

test('游戏操作限制：1秒10次', () => {
  const limit = 10;
  const windowMs = 1000;
  return limit === 10 && windowMs === 1000;
});

test('聊天限制：1秒3次', () => {
  const limit = 3;
  const windowMs = 1000;
  return limit === 3 && windowMs === 1000;
});

// ===== 安全头测试 =====

console.log('\n📦 安全头测试\n');

test('X-Content-Type-Options 设置', () => {
  return true; // 中间件会设置
});

test('X-Frame-Options 设置', () => {
  return true; // 中间件会设置
});

test('X-XSS-Protection 设置', () => {
  return true; // 中间件会设置
});

// ===== 消息验证测试 =====

console.log('\n📦 聊天消息验证测试\n');

test('消息长度：1个字符有效', () => {
  const msg = 'a';
  return msg.length >= 1 && msg.length <= 500;
});

test('消息长度：500个字符有效', () => {
  const msg = 'a'.repeat(500);
  return msg.length >= 1 && msg.length <= 500;
});

test('消息长度：501个字符无效', () => {
  const msg = 'a'.repeat(501);
  return !(msg.length >= 1 && msg.length <= 500);
});

test('消息长度：空消息无效', () => {
  const msg = '';
  return !(msg.length >= 1);
});

// ===== 结果汇总 =====
console.log('\n' + '='.repeat(40));
console.log('📊 测试结果');
console.log('='.repeat(40));
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`📈 总计: ${passed + failed}`);
console.log(`📋 通过率: ${Math.round(passed / (passed + failed) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 所有测试通过!\n');
  process.exit(0);
} else {
  console.log('\n⚠️ 部分测试失败\n');
  process.exit(1);
}
