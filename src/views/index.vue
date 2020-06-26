<template>
  <div class="index">
    <el-dialog title="添加账单" :visible.sync="dialogFormVisible" width="400px">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="账单类型：" prop="type">
          <el-select v-model="form.type" placeholder="请选择账单类型">
            <el-option label="收入" :value="1"></el-option>
            <el-option label="支出" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账单分类：" prop="category">
          <el-select v-model="form.category" placeholder="请选择账单分类">
            <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账单金额：" prop="amount">
          <el-input v-model="form.amount" type="number" placeholder="请输入账单金额"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBillConfrim">确 定</el-button>
      </div>
    </el-dialog>
    <div class="operations">
      <el-date-picker
        value-format="yyyy-MM"
        v-model="currentDate"
        type="month"
        placeholder="选择月">
      </el-date-picker>
      <el-select v-model="currentCategory" placeholder="请选择">
        <el-option
          v-for="item in categories_select"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <el-button @click="addBill" type="primary">添加账单</el-button>
      <el-button @click="exportBills" type="primary">导出账单</el-button>
      <span>收入：{{currentIncome}}</span>
      <span>支出：{{currentPay}}</span>
    </div>
    <el-table :data="currentBillList" style="width:100%">
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        prop="time"
        label="账单时间">
      </el-table-column>
      <el-table-column
        :formatter="typeFormatter"
        align="center"
        prop="type"
        label="账单类型">
      </el-table-column>
      <el-table-column
        :formatter="categoryFormatter"
        align="center"
        prop="category"
        label="账单分类">
      </el-table-column>
      <el-table-column
        :formatter="amountFormatter"
        align="center"
        prop="amount"
        label="账单金额">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import moment from 'moment'
import fileSaver from 'file-saver'
import { jsonToExcel } from '../util/xlsxUtil'
import categoriesCsv from '../excel/categories.csv'
import billCsv from '../excel/bill.csv'
export default {
  data () {
    return {
      // 账单分类
      categories: categoriesCsv,
      // 账单数据
      billList: billCsv,
      // 当前日期
      currentDate: moment().format('YYYY-MM'),
      // 选中账单分类
      currentCategory: '0',
      // 添加账单表单是否可见
      dialogFormVisible: false,
      // 添加账单表单
      form: {},
      // 表单校验
      rules: {
        type: [{ required: true, message: '账单类型为必填', trigger: 'change' }],
        // category: [{ required: true, message: '请选择账单分类', trigger: 'change' }],
        amount: [{
          required: true,
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('账单金额为必填'))
            } else if (!/^-?\d+(,\d{3})*(\.\d{1,2})?$/.test(value)) {
              callback(new Error('请输入精度为小数点后两位的正确金额'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  computed: {
    // 账单分类（筛选）
    categories_select () {
      return [{ id: '0', name: '全部' }].concat(this.categories)
    },
    // 当前月份账单
    currentBillList () {
      const res = this.billList.filter(bill => {
        return this.currentDate === moment(bill.time).format('YYYY-MM') &&
                (this.currentCategory === '0' || this.currentCategory === bill.category)
      })
      return res
    },
    // 当月收入
    currentIncome () {
      let res = 0
      this.currentBillList.forEach(bill => {
        if (bill.type === 1) {
          res += bill.amount
        }
      })
      return (Math.floor(res * 100) / 100).toFixed(2)
    },
    // 当月支出
    currentPay () {
      let res = 0
      this.currentBillList.forEach(bill => {
        if (bill.type === 0) {
          res += bill.amount
        }
      })
      return (Math.floor(res * 100) / 100).toFixed(2)
    }
  },
  methods: {
    // 日期格式化
    dateFormatter (row, column, val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    },
    // 账单类型格式化
    typeFormatter (row, column, val) {
      let res = ''
      if (val === 1) {
        res = '收入'
      } else if (val === 0) {
        res = '支出'
      }
      return res
    },
    // 账单分类格式化
    categoryFormatter (row, column, val) {
      const temp = this.categories.find(c => c.id === val)
      return temp ? temp.name : ''
    },
    // 金额格式化
    amountFormatter (row, column, val) {
      return (Math.floor(val * 100) / 100).toFixed(2)
    },
    // 新增账单
    addBill () {
      this.form = {}
      this.dialogFormVisible = true
    },
    // 新增账单确认
    addBillConfrim () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.time = new Date().getTime()
          this.form.amount = Number(this.form.amount)
          this.billList.push(this.form)
          this.dialogFormVisible = false
        } else {
          return false
        }
      })
    },
    // 导出账单
    exportBills () {
      const xlsx = jsonToExcel({ bill: this.billList })
      const blob = new Blob([xlsx], {
        type: 'application/octet-stream'
      })
      fileSaver.saveAs(blob, 'bill.csv')
    }
  }
}
</script>
<style lang="scss" scoped>
.index{
  width: 1200px;
  margin: 100px auto;
  .operations{
    display: flex;
    justify-content: space-between;
    margin-bottom: 50px;
  }
  .el-select,.el-input{
    width: 217px;
  }
}
</style>
