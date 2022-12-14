const cShape ={
    NONE:       0,
    RECT:       1,
    NGON:       2,
    TEXT:       3,
    POLYGON:    4,
    FREEPEN:    5,
    
    ZPLUS:          11,
    ZMINUS:         12,
    SELECT:         13,
    MOVE:           14,
    DELETE:         15,
    FREEPEN_CLOSE:  16,
    FREEPEN_CANCEL: 17,
    COPY:           18,
    CLONE:          19,
    COLORCHANGE:    20,
    SCALEX:         21,
    SCALEY:         22,
    NEW:            23,
    SAVE_SVG:       24,
    UNDO:           25,
    REDO:           26,
    LOAD_FIREBASE:  27,
    MIRRORX:        28,
    MIRRORY:        29,
};

const cRole = {
    READONLY:   0,      //tylko do odczytu tablicy
    APPEND:     1,      //mozna dodawać własne elementy ale nie modyfikować istniejących cudzych
    MODIFY:     2,      //można modyfikować istniejące ale nie dodawać
    WRITE:      3       //pełnia praw do działań na tablicy
}

const cAction = {
    NONE:       0,
    RECT:       1,
    NGON:       2,
    CIRCLE:     3,
    POLYGON:    4,
    FREEPEN:    5,
}
export { cShape, cAction, cRole};
