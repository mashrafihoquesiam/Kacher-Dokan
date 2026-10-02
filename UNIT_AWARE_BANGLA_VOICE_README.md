# Unit-aware Bangla order voice

The seller Bangla order announcement now uses each product's `unit` field instead of speaking every product as only a quantity count.

Examples:
- 1 × `1 Litre` milk → `১ লিটার দুধ`
- 2 × `1 kg` rice → `২ কেজি চাল`
- 2 × `5 kg` rice → `১০ কেজি চাল`
- 2 × `400 gm` biscuit → `৮০০ গ্রাম বিস্কুট`
- 1 × `12 pcs` eggs → `১২টি ডিম`
- Products without a recognised weight/volume/piece unit fall back to `Nটি পণ্য`.

The same formatter is used by the normal new-order announcement and the seller Replay Voice action.
Supported spoken units: kg, gram/gm, litre/liter, ml, pcs/piece, dozen.
