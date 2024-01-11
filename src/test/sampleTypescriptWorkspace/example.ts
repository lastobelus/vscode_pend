
function existingCode(a: string):string {
    return a;
}

existingCode("Hello");
//                 ^
// should show input with label "existingCode already exists", prefilled with 'existingCode' allowing user to type another name or add a module in front

newCode
//    ^
// makes function newCode()

newCode()
//     ^
// makes function newCode()

newCode()
//      ^
// makes function newCode()

existingCode(newCode)
//                 ^
// makes function newCode()

existingCode(newCode)
//                  ^
// makes function newCode()
// should show input with label "existingCode already exists", prefilled with 'newCode', allowing user to type another name

