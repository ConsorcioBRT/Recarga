export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { default: SftpClient } = await import("ssh2-sftp-client");
  const sftp = new SftpClient();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const recargaId = formData.get("recargaId");
    const undId = formData.get("undId");
    const vclId = formData.get("vclId");
    const dtaIni = formData.get("dtaIni"); // yyyy-mm-dd ou similar

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    //Irá converter para Buffer
    const bytes = await file.arrayBuffer();
    const buffer: Buffer = Buffer.from(bytes);

    // Caminho da chave PEM
    const privateKey = process.env.SFTP_PRIVATE_KEY?.replace(/\\n/g, "\n");

    await sftp.connect({
      host: process.env.SFTP_HOST,
      username: process.env.SFTP_USER,
      privateKey,
      passphrase: process.env.SFTP_PASSPHRASE,
      port: 22,
    });

    // Sobe o arquivo
    const remoteDir = `/home2/escsol02/brtgo.com.br/recarga`;
    const filename = `recarga_${recargaId}_und_${undId}_vcl_${vclId}_${dtaIni}.jpg`;
    const remotePath = `${remoteDir}/${filename}`;

    // Upload
    await sftp.put(buffer, remotePath);

    // Fecha conexão
    await sftp.end();

    // URL pública do arquivo
    const publicUrl = `https://brtgo.com.br/recarga/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Erro ao enviar foto:", error);
    return NextResponse.json(
      { error: "Erro ao enviar foto", details: String(error) },
      { status: 500 }
    );
  }
}
