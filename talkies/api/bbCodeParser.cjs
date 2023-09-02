import { BBCodeParser } from '@panzer1119/bbcode-parser';
import { BBTag } from '@panzer1119/bbcode-parser/lib/bbtag';

/* 
Currently working tags:
b, i, u, text, img, url, code, rainbow, rainbow_gradient
https://github.com/svenslaggare/BBCodeParser/wiki/Documentation
*/
export default function bbCodeParser(inputText) {
    var parser = new BBCodeParser(BBCodeParser.defaultTags());
    var customTags = {};
    var parser2 = new BBCodeParser(customTags);
    customTags["rainbow"] = BBTag.createSimpleTag("p class=\"rainbowText\"")
    customTags["rainbow_gradient"] = BBTag.createSimpleTag("p class=\"rainbowGradText\"")


    
    var output = parser.parseString(inputText);
    var output2 = parser2.parseString(output);
    return output2;
}