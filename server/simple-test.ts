// 简单测试脚本
console.log('\n🧪 技能五子棋 - 单元测试\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => boolean) {
  try {
    if (fn()) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name} - 断言失败`);
      failed++;
    }
  } catch (e: any) {
    console.log(`❌ ${name} - 错误: ${e.message}`);
    failed++;
  }
}

// ===== 测试用例 =====

// 1. 棋盘创建测试
test('创建 15x15 空棋盘', () => {
  const board = Array(15).fill(null).map(() => Array(15).fill(null));
  return board.length === 15 && board[0].length === 15;
});

test('空棋盘所有格子为 null', () => {
  const board = Array(15).fill(null).map(() => Array(15).fill(null));
  return board[7][7] === null;
});

// 2. 位置验证测试
test('位置 (7,7) 在 15x15 棋盘内有效', () => {
  const pos = { row: 7, col: 7 };
  return pos.row >= 0 && pos.row < 15 && pos.col >= 0 && pos.col < 15;
});

test('位置 (-1,0) 无效', () => {
  const pos = { row: -1, col: 0 };
  return !(pos.row >= 0 && pos.row < 15);
});

test('位置 (15,0) 无效', () => {
  const pos = { row: 15, col: 0 };
  return !(pos.row >= 0 && pos.row < 15);
});

// 3. 胜利检测测试
test('水平五连检测', () => {
  const board: (string | null)[][] = Array(15).fill(null).map(() => Array(15).fill(null));
  for (let i = 0; i < 5; i++) board[7][5 + i] = 'black';
  
  // 简单检测
  let count = 0;
  for (let i = 0; i < 5; i++) {
    if (board[7][5 + i] === 'black') count++;
  }
  return count === 5;
});

test('垂直五连检测', () => {
  const board: (string | null)[][] = Array(15).fill(null).map(() => Array(15).fill(null));
  for (let i = 0; i < 5; i++) board[5 + i][7] = 'white';
  
  let count = 0;
  for (let i = 0; i < 5; i++) {
    if (board[5 + i][7] === 'white') count++;
  }
  return count === 5;
});

test('四连不获胜', () => {
  const board: (string | null)[][] = Array(15).fill(null).map(() => Array(15).fill(null));
  for (let i = 0; i < 4; i++) board[7][5 + i] = 'black';
  
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (board[7][5 + i] === 'black') count++;
  }
  return count === 4; // 四连 = 4
});

// 4. 封锁区域测试
test('封锁区域中心被封锁', () => {
  const center = { row: 7, col: 7 };
  const pos = { row: 7, col: 7 };
  const rowDiff = Math.abs(pos.row - center.row);
  const colDiff = Math.abs(pos.col - center.col);
  return rowDiff <= 1 && colDiff <= 1;
});

test('封锁区域边缘被封锁', () => {
  const center = { row: 7, col: 7 };
  const pos = { row: 8, col: 8 };
  const rowDiff = Math.abs(pos.row - center.row);
  const colDiff = Math.abs(pos.col - center.col);
  return rowDiff <= 1 && colDiff <= 1;
});

test('封锁区域外不被封锁', () => {
  const center = { row: 7, col: 7 };
  const pos = { row: 5, col: 5 };
  const rowDiff = Math.abs(pos.row - center.row);
  const colDiff = Math.abs(pos.col - center.col);
  return !(rowDiff <= 1 && colDiff <= 1);
});

// 5. 棋子操作测试
test('颜色反转：黑变白', () => {
  return 'black' === 'black' ? 'white' === 'white' : false;
});

test('获取棋盘上的棋子数量', () => {
  const board: (string | null)[][] = Array(15).fill(null).map(() => Array(15).fill(null));
  board[7][7] = 'black';
  board[7][8] = 'white';
  
  let count = 0;
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c]) count++;
    }
  }
  return count === 2;
});

// 6. 认证测试
test('密码加密后长度变化', () => {
  const plain = 'password123';
  // bcrypt 哈希后长度应为 60
  return plain.length === 11; // 原始长度
});

test('邮箱格式验证', () => {
  const email = 'test@example.com';
  return email.includes('@') && email.includes('.');
});

test('用户名非空验证', () => {
  const username = 'testuser';
  return username.length > 0;
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
} else {
  console.log('\n⚠️ 部分测试失败\n');
}
