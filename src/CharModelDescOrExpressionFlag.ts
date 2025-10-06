import { FFLExpression } from "./enums";
import { FFLCharModelDesc } from "./StructFFLiCharModel";

type CharModelDescOrExpressionFlag = ReturnType<typeof FFLCharModelDesc.unpack> | FFLExpression[] | FFLExpression | Uint32Array | null;

export default CharModelDescOrExpressionFlag
