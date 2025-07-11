// Note: all "sizes" are measured in bytes

/**
 * @internal
 * A view type size
 */
const viewTypes = {
    'Int8': Int8Array,
    'Uint8': Uint8Array,
    'Int16': Int16Array,
    'Uint16': Uint16Array,
    'Int32': Int32Array,
    'Uint32': Uint32Array,
    'Float32': Float32Array
};

/**
 * @internal
 * A view type size
 */
export type ViewType = keyof typeof viewTypes;

/** @internal */
class Struct {
    _pos1: number;
    _pos2: number;
    _pos4: number;
    _pos8: number;
    readonly _structArray: StructArray;

    // The following properties are defined on the prototype of sub classes.
    size: number;

    /**
     * @param structArray - The StructArray the struct is stored in
     * @param index - The index of the struct in the StructArray.
     */
    constructor(structArray: StructArray, index: number) {
        (this as any)._structArray = structArray;
        this._pos1 = index * this.size;
        this._pos2 = this._pos1 / 2;
        this._pos4 = this._pos1 / 4;
        this._pos8 = this._pos1 / 8;
    }
}

const DEFAULT_CAPACITY = 128;
const RESIZE_MULTIPLIER = 5;

/**
 * @internal
 * A struct array member
 */
export type StructArrayMember = {
    name: string;
    type: ViewType;
    components: number;
    offset: number;
};

export type StructArrayLayout = {
    members: Array<StructArrayMember>;
    size: number;
    alignment: number;
};

/**
 * An array that can be deserialized
 */
export type SerializedStructArray = {
    length: number;
    arrayBuffer: ArrayBuffer;
};

/**
 * @internal
 * `StructArray` provides an abstraction over `ArrayBuffer` and `TypedArray`
 * making it behave like an array of typed structs.
 *
 * Conceptually, a StructArray is comprised of elements, i.e., instances of its
 * associated struct type. Each particular struct type, together with an
 * alignment size, determines the memory layout of a StructArray whose elements
 * are of that type.  Thus, for each such layout that we need, we have
 * a corresponding StructArrayLayout class, inheriting from StructArray and
 * implementing `emplaceBack()` and `_refreshViews()`.
 *
 * In some cases, where we need to access particular elements of a StructArray,
 * we implement a more specific subclass that inherits from one of the
 * StructArrayLayouts and adds a `get(i): T` accessor that returns a structured
 * object whose properties are proxies into the underlying memory space for the
 * i-th element.  This affords the convenience of working with (seemingly) plain
 * Javascript objects without the overhead of serializing/deserializing them
 * into ArrayBuffers for efficient web worker transfer.
 */
abstract class StructArray {
    capacity: number;
    length: number;
    isTransferred: boolean;
    arrayBuffer: ArrayBuffer;
    uint8: Uint8Array;

    // The following properties are defined on the prototype.
    members: Array<StructArrayMember>;
    bytesPerElement: number;
    abstract emplaceBack(...v: number[]);
    abstract emplace(i: number, ...v: number[]);

    constructor() {
        this.isTransferred = false;
        this.capacity = -1;
        this.resize(0);
    }

    /**
     * Serialize a StructArray instance.  Serializes both the raw data and the
     * metadata needed to reconstruct the StructArray base class during
     * deserialization.
     */
    static serialize(array: StructArray, transferables?: Array<Transferable>): SerializedStructArray {

        array._trim();

        if (transferables) {
            array.isTransferred = true;
            transferables.push(array.arrayBuffer);
        }

        return {
            length: array.length,
            arrayBuffer: array.arrayBuffer,
        };
    }

    static deserialize(input: SerializedStructArray) {
        const structArray = Object.create(this.prototype);
        structArray.arrayBuffer = input.arrayBuffer;
        structArray.length = input.length;
        structArray.capacity = input.arrayBuffer.byteLength / structArray.bytesPerElement;
        structArray._refreshViews();
        return structArray;
    }

    /**
     * Resize the array to discard unused capacity.
     */
    _trim() {
        if (this.length !== this.capacity) {
            this.capacity = this.length;
            this.arrayBuffer = this.arrayBuffer.slice(0, this.length * this.bytesPerElement);
            this._refreshViews();
        }
    }

    /**
     * Resets the length of the array to 0 without de-allocating capacity.
     */
    clear() {
        this.length = 0;
    }

    /**
     * Resize the array.
     * If `n` is greater than the current length then additional elements with undefined values are added.
     * If `n` is less than the current length then the array will be reduced to the first `n` elements.
     * @param n - The new size of the array.
     */
    resize(n: number) {
        this.reserve(n);
        this.length = n;
    }

    /**
     * Indicate a planned increase in size, so that any necessary allocation may
     * be done once, ahead of time.
     * @param n - The expected size of the array.
     */
    reserve(n: number) {
        if (n > this.capacity) {
            this.capacity = Math.max(n, Math.floor(this.capacity * RESIZE_MULTIPLIER), DEFAULT_CAPACITY);
            this.arrayBuffer = new ArrayBuffer(this.capacity * this.bytesPerElement);

            const oldUint8Array = this.uint8;
            this._refreshViews();
            if (oldUint8Array) this.uint8.set(oldUint8Array);
        }
    }

    /**
     * Create TypedArray views for the current ArrayBuffer.
     */
    _refreshViews() {
        throw new Error('_refreshViews() must be implemented by each concrete StructArray layout');
    }
}

/**
 * Given a list of member fields, create a full StructArrayLayout, in
 * particular calculating the correct byte offset for each field.  This data
 * is used at build time to generate StructArrayLayout_*.emplaceBack() and
 * other accessors, and at runtime for binding vertex buffer attributes.
 */
function createLayout(
    members: Array<{
        name: string;
        type: ViewType;
        readonly components?: number;
    }>,
    alignment: number = 1
): StructArrayLayout {

    let offset = 0;
    let maxSize = 0;
    const layoutMembers = members.map((member) => {
        const typeSize = sizeOf(member.type);
        const memberOffset = offset = align(offset, Math.max(alignment, typeSize));
        const components = member.components || 1;

        maxSize = Math.max(maxSize, typeSize);
        offset += typeSize * components;

        return {
            name: member.name,
            type: member.type,
            components,
            offset: memberOffset,
        };
    });

    const size = align(offset, Math.max(maxSize, alignment));

    return {
        members: layoutMembers,
        size,
        alignment
    };
}

function sizeOf(type: ViewType): number {
    return viewTypes[type].BYTES_PER_ELEMENT;
}

function align(offset: number, size: number): number {
    return Math.ceil(offset / size) * size;
}

export {StructArray, Struct, viewTypes, createLayout};
