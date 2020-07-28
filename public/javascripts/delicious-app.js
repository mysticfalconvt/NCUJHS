import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import typeAheadStudent from "./modules/typeAheadStudent";
import typeAheadTeacher from "./modules/typeAheadTeacher";
import typeAheadUser from "./modules/typeAheadUser";

typeAheadStudent($(".student"));
typeAheadTeacher($(".teacherSearch"), "ta");
typeAheadTeacher($(".mathTeacherSearch"), "math");
typeAheadTeacher($(".languageArtsTeacherSearch"), "languageArts");
typeAheadTeacher($(".scienceTeacherSearch"), "science");
typeAheadTeacher($(".socialStudiesTeacherSearch"), "socialStudies");
typeAheadTeacher($(".trimester1TeacherSearch"), "trimester1");
typeAheadTeacher($(".trimester2TeacherSearch"), "trimester2");
typeAheadTeacher($(".trimester3TeacherSearch"), "trimester3");
typeAheadUser($(".userSearch"));
