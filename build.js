import fs from "fs/promises";
import path from "path";


async function build(){
    const fromPath = './components/poster-creator-mp'
    const distPath = "./dist/poster-creator-mp";
     // 删除现有的目标目录
  await fs.rm(distPath, { recursive: true, force: true });

    // 确保目标目录存在
  await fs.mkdir(distPath, { recursive: true });

  // 将新的文件复制进去
  const items = await fs.readdir(fromPath, { withFileTypes: true });
  items.forEach(async(e)=>{
      const newDstPath = path.join(distPath, e.name);
     await fs.copyFile(`${e.parentPath}/${e.name}`, newDstPath);
  })
}

build()