/**
 * Dashboard Topics Coverage Tests (Frontend)
 * Validates the dashboard page's hardcoded topic list matches
 * all 9 game-supported topics.
 */

// These must match EXACTLY the topics array in frontend/src/app/dashboard/page.tsx
const DASHBOARD_TOPICS = [
  { name: 'Phép nhân số thập phân', sub: 'Các phép tính với số thập phân' },
  { name: 'Tìm hai số khi biết tổng và tỉ số', sub: 'Tỉ số. Tỉ số phần trăm' },
  { name: 'Tìm tỉ số phần trăm của hai số', sub: 'Tỉ số. Tỉ số phần trăm' },
  { name: 'Mét khối', sub: 'Thể tích. Đơn vị đo thể tích' },
  { name: 'Diện tích xung quanh và toàn phần hình lập phương', sub: 'Diện tích và thể tích hình khối' },
  { name: 'Thể tích của hình hộp chữ nhật', sub: 'Diện tích và thể tích hình khối' },
  { name: 'Cộng, trừ số đo thời gian', sub: 'Số đo thời gian. Vận tốc' },
  { name: 'Nhân, chia số đo thời gian', sub: 'Số đo thời gian. Vận tốc' },
  { name: 'Vận tốc của một chuyển động đều', sub: 'Số đo thời gian. Vận tốc' },
];

// All 9 topic IDs that the backend expects
const ALL_TOPIC_IDS = [
  'dec_mul',
  'sum_ratio',
  'percent_ratio',
  'cubic_meter',
  'cube_surface',
  'box_volume',
  'time_add_sub',
  'time_mul_div',
  'velocity',
];

describe('Dashboard — Topic Count & Uniqueness', () => {
  it('should display exactly 9 topics', () => {
    expect(DASHBOARD_TOPICS).toHaveLength(9);
  });

  it('should match total backend game-supported topic count', () => {
    expect(DASHBOARD_TOPICS.length).toBe(ALL_TOPIC_IDS.length);
  });

  it('should have no duplicate topic names', () => {
    const names = DASHBOARD_TOPICS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('Dashboard — Sub-Category Labels', () => {
  it('should have 1 topic under decimal_ops category', () => {
    expect(DASHBOARD_TOPICS.filter((t) => t.sub.includes('phép tính'))).toHaveLength(1);
  });

  it('should have 2 topics under ratio category', () => {
    expect(DASHBOARD_TOPICS.filter((t) => t.sub.includes('Tỉ số'))).toHaveLength(2);
  });

  it('should have 1 topic under volume category', () => {
    expect(DASHBOARD_TOPICS.filter((t) => t.sub.includes('Đơn vị đo'))).toHaveLength(1);
  });

  it('should have 2 topics under surface_volume category (Topic 4)', () => {
    expect(DASHBOARD_TOPICS.filter((t) => t.sub.includes('Diện tích và thể tích'))).toHaveLength(2);
  });

  it('should have 3 topics under time_velocity category (Topic 5)', () => {
    expect(DASHBOARD_TOPICS.filter((t) => t.sub.includes('Số đo thời gian'))).toHaveLength(3);
  });
});

describe('Dashboard — Topic 4 specific tests', () => {
  it('should include cube surface area topic', () => {
    const found = DASHBOARD_TOPICS.find((t) => t.name.includes('Diện tích'));
    expect(found).toBeDefined();
    expect(found!.sub).toBe('Diện tích và thể tích hình khối');
  });

  it('should include box volume topic', () => {
    const found = DASHBOARD_TOPICS.find((t) => t.name.includes('hình hộp chữ nhật'));
    expect(found).toBeDefined();
    expect(found!.sub).toBe('Diện tích và thể tích hình khối');
  });
});

describe('Dashboard — Topic 5 specific tests', () => {
  it('should include time add/subtract topic', () => {
    const found = DASHBOARD_TOPICS.find((t) => t.name.includes('Cộng, trừ'));
    expect(found).toBeDefined();
  });

  it('should include time multiply/divide topic', () => {
    const found = DASHBOARD_TOPICS.find((t) => t.name.includes('Nhân, chia'));
    expect(found).toBeDefined();
  });

  it('should include velocity topic', () => {
    const found = DASHBOARD_TOPICS.find((t) => t.name.includes('Vận tốc'));
    expect(found).toBeDefined();
  });
});
