import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import typeAheadStudent from "./modules/typeAheadStudent";
import typeAheadTeacher from "./modules/typeAheadTeacher";
import typeAheadUser from "./modules/typeAheadUser";
import typeAheadInfo from "./modules/typeAheadInfo";

typeAheadStudent($(".student"));
typeAheadTeacher($(".teacherSearch"), "ta");
typeAheadTeacher($(".mathTeacherSearch"), "math");
typeAheadTeacher($(".languageArtsTeacherSearch"), "languageArts");
typeAheadTeacher($(".scienceTeacherSearch"), "science");
typeAheadTeacher($(".socialStudiesTeacherSearch"), "socialStudies");
typeAheadTeacher($(".trimester1TeacherSearch"), "trimester1");
typeAheadTeacher($(".trimester2TeacherSearch"), "trimester2");
typeAheadTeacher($(".trimester3TeacherSearch"), "trimester3");
typeAheadTeacher($(".teacher1TeacherSearch"), "teacher1");
typeAheadTeacher($(".teacher2TeacherSearch"), "teacher2");
typeAheadTeacher($(".teacher3TeacherSearch"), "teacher3");
typeAheadTeacher($(".block1TeacherSearch"), "block1");
typeAheadTeacher($(".block2TeacherSearch"), "block2");
typeAheadTeacher($(".block3TeacherSearch"), "block3");
typeAheadTeacher($(".block4TeacherSearch"), "block4");
typeAheadTeacher($(".block5TeacherSearch"), "block5");
typeAheadTeacher($(".block6TeacherSearch"), "block6");
typeAheadTeacher($(".block7TeacherSearch"), "block7");
typeAheadTeacher($(".block8TeacherSearch"), "block8");
typeAheadTeacher($(".block9TeacherSearch"), "block9");
typeAheadUser($(".userSearch"));
typeAheadInfo($(".infoSearch"));
