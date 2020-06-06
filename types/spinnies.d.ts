// 因为 spinnies 没有声明文件会导致报错所有我们添加上这个
declare module "spinnies" {
  export = __fix_rn_sound.FixedSound;
}