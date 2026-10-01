import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = formData.get('bucket') as string | null;
    const storagePath = formData.get('path') as string | null;

    if (!file || !bucket || !storagePath) {
      return NextResponse.json(
        { error: 'Missing required parameters: file, bucket, or path' },
        { status: 400 }
      );
    }

    if (bucket !== 'product-images' && bucket !== 'product-pdfs') {
      return NextResponse.json(
        { error: 'Invalid bucket destination' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await admin.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('[UploadAPI] Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let publicUrl: string | null = null;
    if (bucket === 'product-images') {
      const { data: pubData } = admin.storage.from(bucket).getPublicUrl(storagePath);
      publicUrl = pubData?.publicUrl || null;
    }

    return NextResponse.json({
      success: true,
      path: storagePath,
      publicUrl,
    });
  } catch (err: any) {
    console.error('[UploadAPI] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'Server upload failed' },
      { status: 500 }
    );
  }
}
