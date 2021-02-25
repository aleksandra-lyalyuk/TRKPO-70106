package ru.infoenergo.mis.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseExpandableListAdapter
import android.widget.TextView
import ru.infoenergo.mis.R
import ru.infoenergo.mis.helpers.DogSiUu
import ru.infoenergo.mis.helpers.DogUu
import ru.infoenergo.mis.helpers.TAG_ERR

/** *************************************************************** **/
/**    Информация о средствах измерения в таблицу к узлам учёта     **/
/** *************************************************************** **/
class AdaptedExpandedUuSi(
    var context: Context,
    var listUu: ArrayList<DogUu>?,
    var listUuSi: ArrayList<ArrayList<DogSiUu>>?
) : BaseExpandableListAdapter() {

    private val inflater: LayoutInflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    var onItemClickExpand: (() -> Unit)? = { }
    var onItemClickCollapse: (() -> Unit)? = { }
    var expanded: ArrayList<Int> = ArrayList()

    override fun getGroupCount(): Int {
        return listUu!!.size
    }

    override fun getChildrenCount(groupPosition: Int): Int {
        if (listUuSi == null || listUuSi!!.size == 0) return 0
        val uu = getGroupId(groupPosition)
        val si = listUuSi!!.find { it[1].kod_uu == uu.toString() }
        if (si == null || si.size == 0) return 0
        return si.size
    }

    override fun getGroup(groupPosition: Int): DogUu {
        return listUu!![groupPosition]
    }

    override fun getChild(groupPosition: Int, childPosition: Int): DogSiUu {
        if (listUuSi == null || listUuSi!!.size == 0) return DogSiUu()
        val uu = getGroupId(groupPosition)
        val si = listUuSi!!.find { it[1].kod_uu == uu.toString() }
        if (si == null || si.size == 0) return DogSiUu()
        return si[childPosition]
    }

    override fun getGroupId(groupPosition: Int): Long {
        return listUu!![groupPosition].kod_uu.toLong()
    }

    override fun getChildId(groupPosition: Int, childPosition: Int): Long {
        return getGroupId(groupPosition)
    }

    override fun hasStableIds(): Boolean {
        return true
    }

    override fun getGroupView(groupPosition: Int, isExpanded: Boolean, convertView: View?, parent: ViewGroup?): View {
        var view = convertView
        var viewHolderDogUu = ViewHolderDogUu()

        try {
            val item = getGroup(groupPosition)

            // заполнение текствьюеров значениями из списка
            viewHolderDogUu.name?.text = "${item.kod_uu}; ${item.name.replace("null", "")}"
            viewHolderDogUu.mestoUu?.text = item.mesto_uu.replace("null", "")
            viewHolderDogUu.timeUu?.text = item.time_uu.replace("null", "")
            viewHolderDogUu.kodDog?.text = item.kod_dog.toString().replace("null", "")

            if (isExpanded) {
                if (expanded.find { it == groupPosition } == null) expanded.add(groupPosition)
            } else {
                if (expanded.find { it == groupPosition } != null)
                    expanded.removeIf { it == groupPosition }
            }

            if (expanded.size > 0)
                onItemClickExpand?.invoke()
            else
                onItemClickCollapse?.invoke()

        } catch (e: Exception) {
            println("$TAG_ERR AdaptedExpandedUuSi getGroupView: ${e.message}")
        }
        return view!!
    }

    override fun getChildView(
        groupPosition: Int,
        childPosition: Int,
        isLastChild: Boolean,
        convertView: View?,
        parent: ViewGroup?
    ): View {
        var view = convertView
        var viewHolderDogUu = ViewHolderDogUuSi()

        try {

            if (childPosition == 0)
                view!!.setBackgroundResource(R.color.colorLightLightBlue)

            val item = getChild(groupPosition, childPosition)

            // заполнение текствьюеров значениями из списка
            viewHolderDogUu.npp?.text = item.npp.replace("null", "")
            viewHolderDogUu.name_si?.text = item.name_si.replace("null", "")
            viewHolderDogUu.mesto?.text = item.mesto.replace("null", "")
            viewHolderDogUu.obozn_t?.text = item.obozn_t.replace("null", "")
            viewHolderDogUu.name_tip?.text = item.name_tip.replace("null", "")
            viewHolderDogUu.nomer?.text = item.nomer.replace("null", "")
            viewHolderDogUu.dim?.text = item.dim.replace("null", "")
            viewHolderDogUu.izm?.text = item.izm.replace("null", "")
            viewHolderDogUu.data_pov?.text = item.data_pov.replace("null", "")
            viewHolderDogUu.int?.text = item.int.replace("null", "")
            viewHolderDogUu.data_pov_end?.text = item.data_pov_end.replace("null", "")
            viewHolderDogUu.per_chas_arx?.text = item.per_chas_arx.replace("null", "")
            viewHolderDogUu.per_sut_arx?.text = item.per_sut_arx.replace("null", "")
            viewHolderDogUu.n_greest?.text = item.n_greest.replace("null", "")
            viewHolderDogUu.work?.text = item.work.replace("null", "")
            viewHolderDogUu.loss_press?.text = item.loss_press.replace("null", "")
            viewHolderDogUu.data_out?.text = item.data_out.replace("null", "")
            viewHolderDogUu.prim?.text = item.prim.replace("null", "")

        } catch (e: Exception) {
            println("$TAG_ERR AdaptedExpandedUuSi getChildView: ${e.message}")
        }
        return view!!
    }

    override fun isChildSelectable(groupPosition: Int, childPosition: Int): Boolean {
        return true
    }
}


class ViewHolderDogUuSi(
    var npp: TextView? = null,
    var kod_uu: TextView? = null,
    var name_si: TextView? = null,
    var mesto: TextView? = null,
    var obozn_t: TextView? = null,
    var name_tip: TextView? = null,
    var nomer: TextView? = null,
    var dim: TextView? = null,
    var izm: TextView? = null,
    var data_pov: TextView? = null,
    var int: TextView? = null,
    var data_pov_end: TextView? = null,
    var per_chas_arx: TextView? = null,
    var per_sut_arx: TextView? = null,
    var n_greest: TextView? = null,
    var work: TextView? = null,
    var loss_press: TextView? = null,
    var data_out: TextView? = null,
    var prim: TextView? = null
)
