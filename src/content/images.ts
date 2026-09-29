// 사진의 경로와 원본 크기. 크기를 적어 두는 이유: next/image 가 자리를 미리 잡아 레이아웃이 튀지 않게 하려고.
// 설명(alt·캡션)은 언어마다 다르므로 각 언어 파일에서 붙인다.

const DIMENSIONS = {
  'lw_kits-hero-phones': [1400, 933],
  kits_board_top: [1400, 579],
  kits_picker_top: [1400, 612],
  kits_dp_top: [1400, 943],
  kits_bot_crop: [1400, 754],
  kits_html_ba: [1167, 1400],
  kits_round: [1400, 900],
  efm_v4: [1400, 787],
  efm_stages_c: [1400, 734],
  efm_diag_c: [1400, 593],
  efm_kpi_c: [1400, 688],
  efm_att: [1400, 875],
  cli_main: [1400, 933],
  cli_ph: [1400, 787],
  cli_green: [1400, 910],
  cli_loop: [1400, 933],
  sym_flow: [1400, 1197],
  pur_class: [1400, 787],
  pur_matrix: [1292, 1400],
  pur_quiz: [1400, 1357],
  ptx_home: [647, 1400],
  ptx_credit: [647, 1400],
  ptx_comm: [647, 1400],
  ncd_kv: [1400, 612],
  ncd_ux: [1400, 787],
  ncd_plan: [706, 1400],
  ct_coord: [1120, 1400],
  cli_card: [1120, 1400],
  design_atlas: [1400, 875],
  zzan_tab: [390, 1400],
  sw_board: [1400, 1400],
  la_home: [805, 1400],
  web_admin: [1400, 875],
  yt_plan: [1400, 1208],
  'lw_work-1': [1400, 912],
  lw_motion: [1400, 952],
  dp_stats: [1400, 875],
  dt_templates: [1400, 931],
  pray_mock: [1400, 1050],
  dd_live: [1400, 787],
  'early_devhoon-fairhr-website-2025-mockup': [1400, 1050],
  'early_kmong-fair-devhoon-profile': [1400, 787],
} as const satisfies Record<string, readonly [number, number]>;

export type ImageId = keyof typeof DIMENSIONS;

export type Shot = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export function shot(id: ImageId, alt: string, caption?: string): Shot {
  const [width, height] = DIMENSIONS[id];
  return { src: `/work/${id}.jpg`, width, height, alt, caption };
}
